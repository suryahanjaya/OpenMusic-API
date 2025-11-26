const bcrypt = require('bcrypt');

const UsersService = require('../../src/services/postgres/UsersService');
const pool = require('../../src/db/pool');
const InvariantError = require('../../src/lib/error/InvariantError');
const AuthenticationError = require('../../src/lib/error/AuthenticationError');

jest.mock('../../src/db/pool', () => ({
  query: jest.fn(),
}));
jest.mock('bcrypt');
jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('1234567890123456'),
}));

describe('UsersService', () => {
  let usersService;

  beforeEach(() => {
    usersService = new UsersService();
    jest.clearAllMocks();
  });

  describe('addUser', () => {
    it('should persist user and return user id correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      };
      const expectedId = 'user-1234567890123456';

      // Mock check username (not found)
      pool.query.mockResolvedValueOnce({ rowCount: 0 });
      // Mock insert user
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      bcrypt.hash.mockResolvedValue('encrypted_password');

      // Action
      const id = await usersService.addUser(payload);

      // Assert
      expect(pool.query).toHaveBeenCalledWith('SELECT id FROM users WHERE username = $1', [payload.username]);
      expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4)',
        [expectedId, payload.username, 'encrypted_password', payload.fullname],
      );
      expect(id).toEqual(expectedId);
    });

    it('should throw InvariantError when username already exists', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      };

      pool.query.mockResolvedValue({ rowCount: 1 });

      // Action & Assert
      await expect(usersService.addUser(payload))
        .rejects.toThrow(InvariantError);
    });
  });

  describe('verifyUserCredential', () => {
    it('should return user id when credential is valid', async () => {
      // Arrange
      const username = 'dicoding';
      const password = 'secret_password';
      const expectedId = 'user-123';
      const hashedPassword = 'encrypted_password';

      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: expectedId, password: hashedPassword }],
      });

      bcrypt.compare.mockResolvedValue(true);

      // Action
      const id = await usersService.verifyUserCredential(username, password);

      // Assert
      expect(pool.query).toHaveBeenCalledWith('SELECT id, password FROM users WHERE username = $1', [username]);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(id).toEqual(expectedId);
    });

    it('should throw AuthenticationError when username not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rowCount: 0 });

      // Action & Assert
      await expect(usersService.verifyUserCredential('dicoding', 'secret'))
        .rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when password wrong', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 'user-123', password: 'encrypted_password' }],
      });

      bcrypt.compare.mockResolvedValue(false);

      // Action & Assert
      await expect(usersService.verifyUserCredential('dicoding', 'wrong_password'))
        .rejects.toThrow(AuthenticationError);
    });
  });

  describe('getUserById', () => {
    it('should return user correctly', async () => {
      // Arrange
      const expectedUser = {
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      };

      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [expectedUser],
      });

      // Action
      const user = await usersService.getUserById('user-123');

      // Assert
      expect(user).toEqual(expectedUser);
    });

    it('should throw AuthenticationError when user not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rowCount: 0 });

      // Action & Assert
      await expect(usersService.getUserById('user-123'))
        .rejects.toThrow(AuthenticationError);
    });
  });
});
