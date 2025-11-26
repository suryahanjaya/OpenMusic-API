require('dotenv').config();
const path = require('path');

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

const config = require('./config');
/* Services */
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');
const StorageService = require('./services/storage/StorageService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const CacheService = require('./services/redis/CacheService');
/* Validators */
const AlbumsValidator = require('./validators/albumsValidator');
const SongsValidator = require('./validators/songsValidator');
const UsersValidator = require('./validators/usersValidator');
const AuthenticationsValidator = require('./validators/authenticationsValidator');
const PlaylistsValidator = require('./validators/playlistsValidator');
const PlaylistSongsValidator = require('./validators/playlistSongsValidator');
const CollaborationsValidator = require('./validators/collaborationsValidator');
const ExportsValidator = require('./validators/exportsValidator');
const UploadsValidator = require('./validators/uploads');
/* Handlers */
const AlbumsHandler = require('./handlers/AlbumsHandler');
const SongsHandler = require('./handlers/SongsHandler');
const UsersHandler = require('./handlers/UsersHandler');
const AuthenticationsHandler = require('./handlers/AuthenticationsHandler');
const PlaylistsHandler = require('./handlers/PlaylistsHandler');
const PlaylistSongsHandler = require('./handlers/PlaylistSongsHandler');
const CollaborationsHandler = require('./handlers/CollaborationsHandler');
const PlaylistActivitiesHandler = require('./handlers/PlaylistActivitiesHandler');
const ExportsHandler = require('./handlers/ExportsHandler');
/* Routes */
const albumsRoutes = require('./routes/albums');
const songsRoutes = require('./routes/songs');
const usersRoutes = require('./routes/users');
const authenticationsRoutes = require('./routes/authentications');
const playlistsRoutes = require('./routes/playlists');
const playlistSongsRoutes = require('./routes/playlistSongs');
const collaborationsRoutes = require('./routes/collaborations');
const playlistActivitiesRoutes = require('./routes/playlistActivities');
const exportsRoutes = require('./routes/exports');
/* Utils */
const TokenManager = require('./utils/tokenManager');
/* Errors */
const ClientError = require('./lib/error/ClientError');

const createServer = async () => {
  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: { cors: { origin: ['*'] } },
  });

  // register plugins
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // instantiate services
  const cacheService = new CacheService();

  // Ensure cache service is closed when server stops
  server.app.cacheService = cacheService;
  server.ext('onPostStop', async () => {
    await cacheService.quit();
  });

  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const playlistSongsService = new PlaylistSongsService();
  const collaborationsService = new CollaborationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();

  // instantiate handlers
  const albumsHandler = new AlbumsHandler(
    albumsService, storageService, cacheService, AlbumsValidator, UploadsValidator,
  );
  const songsHandler = new SongsHandler(songsService, SongsValidator);
  const usersHandler = new UsersHandler(usersService, UsersValidator);
  const authenticationsHandler = new AuthenticationsHandler(
    authenticationsService, usersService, TokenManager, AuthenticationsValidator,
  );
  const playlistsHandler = new PlaylistsHandler(playlistsService, PlaylistsValidator);
  const playlistSongsHandler = new PlaylistSongsHandler(
    playlistSongsService, playlistsService, playlistActivitiesService, PlaylistSongsValidator,
  );
  const collaborationsHandler = new CollaborationsHandler(
    collaborationsService, playlistsService, usersService, CollaborationsValidator,
  );
  const playlistActivitiesHandler = new PlaylistActivitiesHandler(
    playlistActivitiesService, playlistsService,
  );
  const exportsHandler = new ExportsHandler(ProducerService, playlistsService, ExportsValidator);

  // auth strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { id: artifacts.decoded.payload.userId },
    }),
  });

  // register routes
  server.route(albumsRoutes(albumsHandler));
  server.route(songsRoutes(songsHandler));
  server.route(usersRoutes(usersHandler));
  server.route(authenticationsRoutes(authenticationsHandler));
  server.route(playlistsRoutes(playlistsHandler));
  server.route(playlistSongsRoutes(playlistSongsHandler));
  server.route(collaborationsRoutes(collaborationsHandler));
  server.route(playlistActivitiesRoutes(playlistActivitiesHandler));
  server.route(exportsRoutes(exportsHandler));

  // serve static files
  server.route({
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'api/uploads/file'),
      },
    },
  });

  // global error handling via onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const res = h.response({ status: 'fail', message: response.message });
        res.code(response.statusCode);
        return res;
      }

      if (!response.isServer) return h.continue;

      // Log server errors
      const logger = require('./utils/logger');
      logger.error({
        message: response.message,
        stack: response.stack,
        method: request.method,
        url: request.url.toString(),
      });

      const res = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      res.code(500);
      return res;
    }

    return h.continue;
  });

  // Log all requests
  server.events.on('response', (request) => {
    const logger = require('./utils/logger');
    logger.info({
      method: request.method,
      url: request.url.toString(),
      statusCode: request.response.statusCode,
      responseTime: request.info.completed - request.info.received,
    });
  });

  return server;
};

module.exports = createServer;
