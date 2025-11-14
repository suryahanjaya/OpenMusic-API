const express = require('express');
const app = express();
const albumRoutes = require('./routes/albums');
const songRoutes = require('./routes/songs');

app.use(express.json());

app.use('/albums', albumRoutes);
app.use('/songs', songRoutes);

// Error handling
app.use((req, res, next) => {
  res.status(404).json({ status: 'fail', message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if(err.isJoi) return res.status(400).json({ status: 'fail', message: err.message });
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

module.exports = app;
