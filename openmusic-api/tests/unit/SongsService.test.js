const SongsService = require('../../src/services/postgres/SongsService');
const pool = require('../../src/db/pool');
const InvariantError = require('../../src/lib/error/InvariantError');
const NotFoundError = require('../../src/lib/error/ClientError');

jest.mock('../../src/db/pool', () => ({
  query: jest.fn(),
}));
jest.mock('../../src/utils/idGenerator', () => ({
  generateId: jest.fn().mockReturnValue('song-123'),
}));

describe('SongsService', () => {
  let songsService;

  beforeEach(() => {
    songsService = new SongsService();
    jest.clearAllMocks();
  });

  describe('addSong', () => {
    it('should persist song and return song id correctly', async () => {
      // Arrange
      const payload = {
        title: 'Song A',
        year: 2021,
        performer: 'Performer A',
        genre: 'Pop',
        duration: 120,
        albumId: 'album-123',
      };
      const expectedId = 'song-123';

      pool.query.mockResolvedValue({
        rows: [{ id: expectedId }],
      });

      // Action
      const id = await songsService.addSong(payload);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('INSERT INTO songs'),
        values: [expectedId, payload.title, payload.year, payload.performer, payload.genre, payload.duration, payload.albumId],
      }));
      expect(id).toEqual(expectedId);
    });

    it('should throw InvariantError when song not added', async () => {
      // Arrange
      const payload = {
        title: 'Song A',
        year: 2021,
        performer: 'Performer A',
        genre: 'Pop',
        duration: 120,
      };

      pool.query.mockResolvedValue({
        rows: [],
      });

      // Action & Assert
      await expect(songsService.addSong(payload))
        .rejects.toThrow(InvariantError);
    });
  });

  describe('getSongs', () => {
    it('should return songs correctly', async () => {
      // Arrange
      const expectedSongs = [
        { id: 'song-123', title: 'Song A', performer: 'Performer A' },
      ];

      pool.query.mockResolvedValue({
        rows: expectedSongs,
      });

      // Action
      const songs = await songsService.getSongs({});

      // Assert
      expect(songs).toEqual(expectedSongs);
    });

    it('should return songs filtered by title and performer', async () => {
      // Arrange
      const expectedSongs = [
        { id: 'song-123', title: 'Song A', performer: 'Performer A' },
      ];

      pool.query.mockResolvedValue({
        rows: expectedSongs,
      });

      // Action
      await songsService.getSongs({ title: 'Song', performer: 'Performer' });

      // Assert
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('WHERE lower(title) LIKE $1 AND lower(performer) LIKE $2'),
        values: ['%song%', '%performer%'],
      }));
    });
  });

  describe('getSongById', () => {
    it('should return song correctly', async () => {
      // Arrange
      const expectedSong = {
        id: 'song-123',
        title: 'Song A',
        year: 2021,
        performer: 'Performer A',
        genre: 'Pop',
        duration: 120,
        album_id: 'album-123',
      };

      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [expectedSong],
      });

      // Action
      const song = await songsService.getSongById('song-123');

      // Assert
      expect(song).toEqual({
        id: expectedSong.id,
        title: expectedSong.title,
        year: expectedSong.year,
        performer: expectedSong.performer,
        genre: expectedSong.genre,
        duration: expectedSong.duration,
        albumId: expectedSong.album_id,
      });
    });

    it('should throw NotFoundError when song not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 0,
      });

      // Action & Assert
      await expect(songsService.getSongById('song-123'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('editSongById', () => {
    it('should update song correctly', async () => {
      // Arrange
      const payload = {
        title: 'Song A Updated',
        year: 2022,
        performer: 'Performer A',
        genre: 'Pop',
        duration: 120,
        albumId: 'album-123',
      };

      pool.query.mockResolvedValue({
        rowCount: 1,
      });

      // Action
      await songsService.editSongById('song-123', payload);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('UPDATE songs'),
        values: [payload.title, payload.year, payload.performer, payload.genre, payload.duration, payload.albumId, 'song-123'],
      }));
    });

    it('should throw NotFoundError when song to update not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 0,
      });

      // Action & Assert
      await expect(songsService.editSongById('song-123', { title: 'A', year: 2021, performer: 'P', genre: 'G' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteSongById', () => {
    it('should delete song correctly', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 'song-123' }],
      });

      // Action
      await songsService.deleteSongById('song-123');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('DELETE FROM songs'),
        values: ['song-123'],
      }));
    });

    it('should throw NotFoundError when song to delete not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 0,
      });

      // Action & Assert
      await expect(songsService.deleteSongById('song-123'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
