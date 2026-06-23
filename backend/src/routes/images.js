const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const store = require('../store');

const router = express.Router({ mergeParams: true });

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Formato no permitido. Use JPG, PNG o WebP.'), { code: 'INVALID_TYPE' }));
    }
  },
});

// POST /api/v1/services/:serviceId/images
router.post('/', auth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen supera el tamaño máximo de 5 MB.'
          : err.message;
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: msg });
    }

    const { serviceId } = req.params;
    const { freelancerId } = req.user;

    const service = store.services.get(serviceId);
    if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });
    if (service.freelancerId !== freelancerId) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
    }

    const current = Array.from(store.images.values()).filter((i) => i.serviceId === serviceId);
    if (current.length >= MAX_IMAGES) {
      return res.status(409).json({
        error: 'CONFLICT',
        message: `El servicio ya tiene el máximo de ${MAX_IMAGES} imágenes.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Se requiere un archivo de imagen.' });
    }

    const displayOrder = req.body.displayOrder ? parseInt(req.body.displayOrder) : current.length + 1;
    const id = uuidv4();
    const uploadedAt = new Date().toISOString();

    store.images.set(id, {
      id,
      serviceId,
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      displayOrder,
      uploadedAt,
    });

    res.status(201).json({ id, serviceId, imageUrl: `/api/v1/images/${id}`, displayOrder, uploadedAt });
  });
});

// DELETE /api/v1/services/:serviceId/images/:imageId
router.delete('/:imageId', auth, (req, res) => {
  const { serviceId, imageId } = req.params;
  const { freelancerId } = req.user;

  const service = store.services.get(serviceId);
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });
  if (service.freelancerId !== freelancerId) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }

  const image = store.images.get(imageId);
  if (!image || image.serviceId !== serviceId) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Imagen no encontrada.' });
  }

  store.images.delete(imageId);
  res.status(204).send();
});

module.exports = router;
