require('dotenv').config();
const Hapi = require('@hapi/hapi');

const albums = require('./api/albums');
const songs = require('./api/songs');

const AlbumsService = require('./services/AlbumsService');
const SongsService = require('./services/SongsService');

const AlbumsValidator = require('./validators/albums');
const SongsValidator = require('./validators/songs');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: { origin: ['*'] }
    }
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator
      }
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      }
    }
  ]);

  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    if (response instanceof Error) {
      if (response.name === 'ClientError') {
        return h.response({
          status: 'fail',
          message: response.message
        }).code(response.statusCode);
      }

      console.error(response);
      return h.response({
        status: 'error',
        message: 'Internal server error'
      }).code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
