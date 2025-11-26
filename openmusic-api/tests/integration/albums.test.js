process.env.NODE_ENV = 'test'; // Force test environment

const supertest = require('supertest');

const createServer = require('../../src/app');
const pool = require('../../src/db/pool');

const TableTestHelper = require('./helper');

describe('Albums API', () => {
  let server;
  let request;

  beforeAll(async () => {
    server = await createServer();
    await server.start();
    request = supertest(server.listener);
  });

  afterAll(async () => {
    await server.stop();
    await pool.end();
  });

  afterEach(async () => {
    await TableTestHelper.cleanTable();
  });

  describe('POST /albums', () => {
    it('should respond with 201 and album id', async () => {
      // Arrange
      const payload = {
        name: 'Album A',
        year: 2021,
      };

      // Action
      const response = await request.post('/albums').send(payload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.albumId).toBeDefined();
    });

    it('should respond with 400 when payload is bad', async () => {
      // Arrange
      const payload = {
        name: 'Album A',
      };

      // Action
      const response = await request.post('/albums').send(payload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('GET /albums/{id}', () => {
    it('should respond with 200 and album data', async () => {
      // Arrange
      const payload = {
        name: 'Album A',
        year: 2021,
      };
      const postResponse = await request.post('/albums').send(payload);
      const { albumId } = postResponse.body.data;

      // Action
      const response = await request.get(`/albums/${albumId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.album).toBeDefined();
      expect(response.body.data.album.id).toEqual(albumId);
    });

    it('should respond with 404 when album not found', async () => {
      // Action
      const response = await request.get('/albums/album-unknown');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('PUT /albums/{id}', () => {
    it('should respond with 200 and success message', async () => {
      // Arrange
      const payload = {
        name: 'Album A',
        year: 2021,
      };
      const postResponse = await request.post('/albums').send(payload);
      const { albumId } = postResponse.body.data;

      const updatePayload = {
        name: 'Album A Updated',
        year: 2022,
      };

      // Action
      const response = await request.put(`/albums/${albumId}`).send(updatePayload);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('DELETE /albums/{id}', () => {
    it('should respond with 200 and success message', async () => {
      // Arrange
      const payload = {
        name: 'Album A',
        year: 2021,
      };
      const postResponse = await request.post('/albums').send(payload);
      const { albumId } = postResponse.body.data;

      // Action
      const response = await request.delete(`/albums/${albumId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.message).toBeDefined();
    });
  });
});
