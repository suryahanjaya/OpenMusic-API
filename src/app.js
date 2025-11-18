require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

/* Database Pool */
const pool = require('./db/pool');

/* Services */
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

/* Validators */
const AlbumsValidator = require('./validators/albumsValidator');
const SongsValidator = require('./validators/songsValidator');
const UsersValidator = require('./validators/usersValidator');
const AuthenticationsValidator = require('./validators/authenticationsValidator');
const PlaylistsValidator = require('./validators/playlistsValidator');
const PlaylistSongsValidator = require('./validators/playlistSongsValidator');
const CollaborationsValidator = require('./validators/collaborationsValidator');

/* Handlers */
const AlbumsHandler = require('./handlers/AlbumsHandler');
const SongsHandler = require('./handlers/SongsHandler');
const UsersHandler = require('./handlers/UsersHandler');
const AuthenticationsHandler = require('./handlers/AuthenticationsHandler');
const PlaylistsHandler = require('./handlers/PlaylistsHandler');
const PlaylistSongsHandler = require('./handlers/PlaylistSongsHandler');
const CollaborationsHandler = require('./handlers/CollaborationsHandler');
const PlaylistActivitiesHandler = require('./handlers/PlaylistActivitiesHandler');

/* Routes */
const albumsRoutes = require('./routes/albums');
const songsRoutes = require('./routes/songs');
const usersRoutes = require('./routes/users');
const authenticationsRoutes = require('./routes/authentications');
const playlistsRoutes = require('./routes/playlists');
const playlistSongsRoutes = require('./routes/playlistSongs');
const collaborationsRoutes = require('./routes/collaborations');
const playlistActivitiesRoutes = require('./routes/playlistActivities');

/* Utils */
const TokenManager = require('./utils/tokenManager');

/* Errors */
const ClientError = require('./lib/error/ClientError');

const createServer = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: { cors: { origin: ['*'] } },
  });

  // register jwt plugin
  await server.register(Jwt);

  // instantiate services
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const playlistSongsService = new PlaylistSongsService();
  const collaborationsService = new CollaborationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();

  // instantiate handlers
  const albumsHandler = new AlbumsHandler(albumsService, AlbumsValidator);
  const songsHandler = new SongsHandler(songsService, SongsValidator);
  const usersHandler = new UsersHandler(usersService, UsersValidator);
  const authenticationsHandler = new AuthenticationsHandler(
    authenticationsService, usersService, TokenManager, AuthenticationsValidator
  );
  const playlistsHandler = new PlaylistsHandler(playlistsService, PlaylistsValidator);
  const playlistSongsHandler = new PlaylistSongsHandler(
    playlistSongsService, playlistsService, PlaylistSongsValidator
  );
  const collaborationsHandler = new CollaborationsHandler(
    collaborationsService, playlistsService, CollaborationsValidator
  );
  const playlistActivitiesHandler = new PlaylistActivitiesHandler(
    playlistActivitiesService, playlistsService
  );

  // auth strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
        ? parseInt(process.env.ACCESS_TOKEN_AGE, 10)
        : 3600,
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

      console.error(response);
      const res = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      res.code(500);
      return res;
    }

    return h.continue;
  });

  return server;
};

module.exports = createServer;
