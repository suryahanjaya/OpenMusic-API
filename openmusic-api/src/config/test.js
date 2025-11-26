require('dotenv').config();

const config = {
  app: {
    host: '127.0.0.1',
    port: process.env.PORT || 5001,
  },
  db: {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE_TEST || process.env.PGDATABASE,
    port: process.env.PGPORT,
  },
  jwt: {
    accessTokenKey: 'test-access-key',
    refreshTokenKey: 'test-refresh-key',
    accessTokenAge: 3600,
  },
  s3: {
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER || '127.0.0.1',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
};

module.exports = config;
