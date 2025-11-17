const express = require('express');
const app = express();
const albumRoutes = require('./routes/albums');
const songRoutes = require('./routes/songs');
const ClientError = require('./exceptions/ClientError'); // Import ClientError

app.use(express.json());

app.use('/albums', albumRoutes);
app.use('/songs', songRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  // Jika error dari Joi (Validation Error)
  if (err.isJoi) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Jika error adalah ClientError (NotFoundError / InvariantError)
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Jika Server Error (500)
  console.error(err); // Log error server ke console untuk debugging
  return res.status(500).json({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });
});

// 404 Handling untuk route yang tidak terdaftar
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Resource not found',
  });
});

module.exports = app;