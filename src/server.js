const initApp = require('./app');

const start = async () => {
  const server = await initApp();
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

start();
