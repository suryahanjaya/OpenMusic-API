process.env.NODE_ENV = 'test';

const path = require('path');
const fs = require('fs');

const supertest = require('supertest');

const createServer = require('../../src/app');
const pool = require('../../src/db/pool');

const TableTestHelper = require('./helper');

describe('OpenMusic V3 Features', () => {
  let server;
  let request;
  let accessToken;

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

  // Helper to register and login
  const getAccessToken = async () => {
    const userPayload = {
      username: 'user_v3',
      password: 'password',
      fullname: 'User V3',
    };
    await request.post('/users').send(userPayload);

    const authPayload = {
      username: 'user_v3',
      password: 'password',
    };
    const response = await request.post('/authentications').send(authPayload);
    return response.body.data.accessToken;
  };

  describe('Album Likes (Caching)', () => {
    it('should handle likes correctly with caching', async () => {
      accessToken = await getAccessToken();

      // 1. Create Album
      const albumPayload = { name: 'Album Likes', year: 2023 };
      const albumRes = await request.post('/albums').send(albumPayload);
      if (albumRes.status !== 201) fs.appendFileSync('test_failures.log', `Create Album Failed: ${JSON.stringify(albumRes.body)}\n`);
      expect(albumRes.status).toEqual(201);
      const albumId = albumRes.body.data.albumId;

      // 2. Like Album
      const likeRes = await request.post(`/albums/${albumId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);
      if (likeRes.status !== 201) fs.appendFileSync('test_failures.log', `Like Album Failed: ${JSON.stringify(likeRes.body)}\n`);
      expect(likeRes.status).toEqual(201);

      // 3. Get Likes (First hit - no cache)
      const getRes1 = await request.get(`/albums/${albumId}/likes`);
      if (getRes1.status !== 200) fs.appendFileSync('test_failures.log', `Get Likes 1 Failed: ${JSON.stringify(getRes1.body)}\n`);
      expect(getRes1.status).toEqual(200);
      expect(getRes1.body.data.likes).toEqual(1);
      expect(getRes1.header['x-data-source']).toBeUndefined();

      // 4. Get Likes (Second hit - should be from cache if Redis is available)
      const getRes2 = await request.get(`/albums/${albumId}/likes`);
      if (getRes2.status !== 200) fs.appendFileSync('test_failures.log', `Get Likes 2 Failed: ${JSON.stringify(getRes2.body)}\n`);
      expect(getRes2.status).toEqual(200);
      expect(getRes2.body.data.likes).toEqual(1);
      // Cache header is optional - only present if Redis is running
      if (getRes2.header['x-data-source']) {
        expect(getRes2.header['x-data-source']).toEqual('cache');
      }

      // 5. Unlike Album
      const unlikeRes = await request.delete(`/albums/${albumId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);
      if (unlikeRes.status !== 200) fs.appendFileSync('test_failures.log', `Unlike Album Failed: ${JSON.stringify(unlikeRes.body)}\n`);
      expect(unlikeRes.status).toEqual(200);

      // 6. Get Likes (Cache invalidated)
      const getRes3 = await request.get(`/albums/${albumId}/likes`);
      if (getRes3.status !== 200) fs.appendFileSync('test_failures.log', `Get Likes 3 Failed: ${JSON.stringify(getRes3.body)}\n`);
      expect(getRes3.status).toEqual(200);
      expect(getRes3.body.data.likes).toEqual(0);
      expect(getRes3.header['x-data-source']).toBeUndefined();
    });
  });

  describe('Album Cover Upload', () => {
    it('should upload cover successfully', async () => {
      // 1. Create Album
      const albumPayload = { name: 'Album Cover', year: 2023 };
      const albumRes = await request.post('/albums').send(albumPayload);
      if (albumRes.status !== 201) fs.appendFileSync('test_failures.log', `Create Album for Cover Failed: ${JSON.stringify(albumRes.body)}\n`);
      expect(albumRes.status).toEqual(201);
      const albumId = albumRes.body.data.albumId;

      // Create a dummy image file
      const filePath = path.resolve(__dirname, 'cover.jpg');
      fs.writeFileSync(filePath, 'dummy image content');

      // 2. Upload Cover
      const uploadRes = await request.post(`/albums/${albumId}/covers`)
        .attach('cover', filePath);

      // Clean up file
      fs.unlinkSync(filePath);

      if (uploadRes.status !== 201) fs.appendFileSync('test_failures.log', `Upload Cover Failed: ${JSON.stringify(uploadRes.body)}\n`);
      expect(uploadRes.status).toEqual(201);
      expect(uploadRes.body.message).toEqual('Sampul berhasil diunggah');

      // 3. Get Album to verify coverUrl
      const getRes = await request.get(`/albums/${albumId}`);
      if (getRes.status !== 200) fs.appendFileSync('test_failures.log', `Get Album for Cover Failed: ${JSON.stringify(getRes.body)}\n`);
      expect(getRes.status).toEqual(200);
      expect(getRes.body.data.album.coverUrl).toBeDefined();
      expect(getRes.body.data.album.coverUrl).toMatch(/http:\/\/.*\/upload\/images\/.*/);
    });
  });

  describe('Export Playlist', () => {
    it('should request playlist export successfully', async () => {
      accessToken = await getAccessToken();

      // 1. Create Playlist
      const playlistPayload = { name: 'My Playlist' };
      const playlistRes = await request.post('/playlists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(playlistPayload);
      if (playlistRes.status !== 201) fs.appendFileSync('test_failures.log', `Create Playlist Failed: ${JSON.stringify(playlistRes.body)}\n`);
      expect(playlistRes.status).toEqual(201);
      const playlistId = playlistRes.body.data.playlistId;

      // 2. Export Playlist
      const exportPayload = { targetEmail: 'test@example.com' };
      const exportRes = await request.post(`/export/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(exportPayload);

      if (exportRes.status !== 201) fs.appendFileSync('test_failures.log', `Export Playlist Failed: ${JSON.stringify(exportRes.body)}\n`);
      expect(exportRes.status).toEqual(201);
      expect(exportRes.body.message).toEqual('Permintaan Anda sedang kami proses');
    });
  });
});
