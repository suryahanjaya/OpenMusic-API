const AuthenticationsService = require('../../src/services/postgres/AuthenticationsService');
const pool = require('../../src/db/pool');
const InvariantError = require('../../src/lib/error/InvariantError');

jest.mock('../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('AuthenticationsService', () => {
  let authenticationsService;

  beforeEach(() => {
    authenticationsService = new AuthenticationsService();
    jest.clearAllMocks();
  });

  describe('addRefreshToken', () => {
    it('should add refresh token correctly', async () => {
      // Arrange
      const token = 'refresh_token';
      const userId = 'user-123';

      pool.query.mockResolvedValue({ rowCount: 1 });

      // Action
      await authenticationsService.addRefreshToken(token, userId);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO authentications (token, user_id) VALUES ($1, $2)',
        [token, userId],
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token correctly', async () => {
      // Arrange
      const token = 'refresh_token';

      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ token }],
      });

      // Action
      await authenticationsService.verifyRefreshToken(token);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT token FROM authentications WHERE token = $1',
        [token],
      );
    });

    it('should throw InvariantError when refresh token not valid', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rowCount: 0 });

      // Action & Assert
      try {
        await authenticationsService.verifyRefreshToken('invalid_token');
        throw new Error('Should have thrown');
      } catch (e) {
        if (e.message === 'Should have thrown') throw e;
        if (!(e instanceof InvariantError)) throw new Error(`Not InvariantError: ${  e.name}`);
        if (e.message !== 'refresh token tidak valid') throw new Error(`Wrong message: ${  e.message}`);
      }
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token correctly', async () => {
      // Arrange
      const token = 'refresh_token';

      pool.query.mockResolvedValue({ rowCount: 1 });

      // Action
      await authenticationsService.deleteRefreshToken(token);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM authentications WHERE token = $1',
        [token],
      );
    });
  });
});
