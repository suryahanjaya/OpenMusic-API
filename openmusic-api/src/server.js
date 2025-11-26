require('dotenv').config();
const createServer = require('./app');

const init = async () => {
  const server = await createServer();
  await server.start();

  console.warn(`Server berjalan pada ${server.info.uri}`);
};

init();
