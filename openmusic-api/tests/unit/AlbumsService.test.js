const AlbumsService = require('../../src/services/postgres/AlbumsService');
const pool = require('../../src/db/pool');
const InvariantError = require('../../src/lib/error/InvariantError');
const NotFoundError = require('../../src/lib/error/ClientError');

jest.mock('../../src/db/pool', () => ({
  query: jest.fn(),
}));
jest.mock('../../src/utils/idGenerator', () => ({
  generateId: jest.fn().mockReturnValue('album-123'),
}));

describe('AlbumsService', () => {
  let albumsService;

  beforeEach(() => {
    albumsService = new AlbumsService();
    jest.clearAllMocks();
  });

  describe('addAlbum', () => {
    it('should persist album and return album id correctly', async () => {
      // Arrange
      const payload = {
        name: 'Album A',
        year: 2021,
      };
      const expectedId = 'album-123';

      pool.query.mockResolvedValue({
        rows: [{ id: expectedId }],
      });

      // Action
      const id = await albumsService.addAlbum(payload);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('INSERT INTO albums'),
        values: [expectedId, payload.name, payload.year],
      }));
      expect(id).toEqual(expectedId);
    });

    it('should throw InvariantError when album not added', async () => {
      // Arrange
      const payload = {
        name: 'Album A',
        year: 2021,
      };

      pool.query.mockResolvedValue({
        rows: [],
      });

      // Action & Assert
      await expect(albumsService.addAlbum(payload))
        .rejects.toThrow(InvariantError);
    });
  });

  describe('getAlbumById', () => {
    it('should return album correctly', async () => {
      // Arrange
      const expectedAlbum = {
        id: 'album-123',
        name: 'Album A',
        year: 2021,
      };

      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [expectedAlbum],
      });

      // Action
      const album = await albumsService.getAlbumById('album-123');

      // Assert
      expect(album).toEqual(expectedAlbum);
    });

    it('should throw NotFoundError when album not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 0,
      });

      // Action & Assert
      await expect(albumsService.getAlbumById('album-123'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('editAlbumById', () => {
    it('should update album correctly', async () => {
      // Arrange
      const payload = {
        name: 'Album A Updated',
        year: 2022,
      };

      pool.query.mockResolvedValue({
        rowCount: 1,
      });

      // Action
      await albumsService.editAlbumById('album-123', payload);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('UPDATE albums'),
        values: [payload.name, payload.year, 'album-123'],
      }));
    });

    it('should throw NotFoundError when album to update not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 0,
      });

      // Action & Assert
      await expect(albumsService.editAlbumById('album-123', { name: 'A', year: 2021 }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAlbumById', () => {
    it('should delete album correctly', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 1,
      });

      // Action
      await albumsService.deleteAlbumById('album-123');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('DELETE FROM albums'),
        values: ['album-123'],
      }));
    });

    it('should throw NotFoundError when album to delete not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 0,
      });

      // Action & Assert
      await expect(albumsService.deleteAlbumById('album-123'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
