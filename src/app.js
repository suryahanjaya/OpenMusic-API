const Hapi = require('@hapi/hapi');
require('dotenv').config();

const AlbumsService = require('./services/AlbumsService');
const SongsService = require('./services/SongsService');

const AlbumsHandler = require('./handlers/AlbumsHandler');
const SongsHandler = require('./handlers/SongsHandler');

const albumsRoutes = require('./routes/albums');
const songsRoutes = require('./routes/songs');

const ClientError = require('./lib/error/ClientError');

const initApp = async () => {
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 5000;

  const server = Hapi.server({ port, host });

  // services & handlers
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const albumsHandler = new AlbumsHandler(albumsService, require('./validators/albumsValidator'));
  const songsHandler = new SongsHandler(songsService, require('./validators/songsValidator'));

  server.route(albumsRoutes(albumsHandler));
  server.route(songsRoutes(songsHandler));

  // global error handling via onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // client error
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // hapi internal client errors (e.g. 404)
      if (!response.isServer) {
        return h.continue;
      }

      // server error
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  return server;
};

module.exports = initApp;
