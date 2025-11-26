const redis = require('redis');

const config = require('../../config');

class CacheService {
  constructor() {
    this._isConnected = false;
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
        connectTimeout: 5000, // 5 second timeout
      },
    });

    this._client.on('error', (error) => {
      this._isConnected = false;
      // Only log in non-test environments to reduce noise
      if (process.env.NODE_ENV !== 'test') {
        console.error('Redis connection error:', error);
      }
    });

    this._client.on('ready', () => {
      this._isConnected = true;
    });

    // Attempt to connect, but don't fail if Redis is unavailable
    this._client.connect().catch(() => {
      this._isConnected = false;
      // Disconnect the client to prevent hanging
      this._client.disconnect().catch(() => {
        // Ignore disconnect errors
      });
    });
  }

  async set(key, value, expirationInSecond = 1800) {
    if (!this._isConnected) return null;
    try {
      await this._client.set(key, value, {
        EX: expirationInSecond,
      });
    } catch {
      // Silently fail if Redis is unavailable
      return null;
    }
  }

  async get(key) {
    if (!this._isConnected) return null;
    try {
      const result = await this._client.get(key);
      return result;
    } catch {
      return null;
    }
  }

  async delete(key) {
    if (!this._isConnected) return null;
    try {
      return this._client.del(key);
    } catch {
      return null;
    }
  }

  async quit() {
    try {
      if (this._isConnected) {
        await this._client.quit();
      } else {
        await this._client.disconnect();
      }
    } catch {
      // Try disconnect as fallback
      try {
        await this._client.disconnect();
      } catch {
        // Ignore errors on cleanup
      }
    }
  }
}

module.exports = CacheService;
