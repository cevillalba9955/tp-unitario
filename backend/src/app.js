const express = require('express');
const cors = require('cors');
const store = require('./store');
const authRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const servicesRouter = require('./routes/services');
const imagesRouter = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Public image serving (sin auth para React Native <Image />)
app.get('/api/v1/images/:imageId', (req, res) => {
  const image = store.images.get(req.params.imageId);
  if (!image) return res.status(404).json({ error: 'NOT_FOUND', message: 'Imagen no encontrada.' });
  res.setHeader('Content-Type', image.mimeType);
  res.send(image.imageBuffer);
});

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/services', servicesRouter);
app.use('/api/v1/services/:serviceId/images', imagesRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`FreelanceHub backend corriendo en puerto ${PORT}`);
});

module.exports = app;
