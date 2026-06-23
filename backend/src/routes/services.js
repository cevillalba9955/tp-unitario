const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const store = require('../store');
const { validatePublish, validateFields } = require('../validators/serviceValidator');

const router = express.Router();

function getServicePackages(serviceId) {
  return Array.from(store.packages.values())
    .filter((p) => p.serviceId === serviceId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

function getServiceImages(serviceId) {
  return Array.from(store.images.values())
    .filter((i) => i.serviceId === serviceId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(({ imageBuffer, ...meta }) => ({ ...meta, imageUrl: `/api/v1/images/${meta.id}` }));
}

// GET /api/v1/services/my
router.get('/my', auth, (req, res) => {
  const { freelancerId } = req.user;
  const { status, page = '0', limit = '20' } = req.query;

  let services = Array.from(store.services.values()).filter(
    (s) => s.freelancerId === freelancerId
  );
  if (status) services = services.filter((s) => s.status === status.toUpperCase());

  const total = services.length;
  const pageNum = Math.max(0, parseInt(page) || 0);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));

  const data = services
    .slice(pageNum * limitNum, (pageNum + 1) * limitNum)
    .map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      categoryId: s.categoryId,
      packageCount: Array.from(store.packages.values()).filter((p) => p.serviceId === s.id).length,
      imageCount: Array.from(store.images.values()).filter((i) => i.serviceId === s.id).length,
      updatedAt: s.updatedAt,
    }));

  res.json({ data, pagination: { page: pageNum, limit: limitNum, total } });
});

// POST /api/v1/services
router.post('/', auth, (req, res) => {
  const { freelancerId } = req.user;
  const { title = '', description = '', categoryId = null } = req.body;

  const { valid, errors } = validateFields({ title, description });
  if (!valid) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: errors.join('; ') });
  }

  if (categoryId && !store.categories.has(categoryId)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Categoría no válida.' });
  }

  const now = new Date().toISOString();
  const service = {
    id: uuidv4(),
    title,
    description,
    categoryId,
    status: 'DRAFT',
    freelancerId,
    createdAt: now,
    updatedAt: now,
  };

  store.services.set(service.id, service);
  res.status(201).json({ ...service, packages: [], images: [] });
});

// GET /api/v1/services/:id
router.get('/:id', auth, (req, res) => {
  const service = store.services.get(req.params.id);
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });

  if (service.status === 'DRAFT' && service.freelancerId !== req.user.freelancerId) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }

  res.json({
    ...service,
    packages: getServicePackages(service.id),
    images: getServiceImages(service.id),
  });
});

// PUT /api/v1/services/:id
router.put('/:id', auth, (req, res) => {
  const service = store.services.get(req.params.id);
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });
  if (service.freelancerId !== req.user.freelancerId) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }

  const { title, description, categoryId, packages: pkgsBody } = req.body;

  const { valid, errors } = validateFields({ title, description, packages: pkgsBody });
  if (!valid) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: errors.join('; ') });
  }

  if (categoryId !== undefined && categoryId !== null && !store.categories.has(categoryId)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Categoría no válida.' });
  }

  if (title !== undefined) service.title = title;
  if (description !== undefined) service.description = description;
  if (categoryId !== undefined) service.categoryId = categoryId;
  service.updatedAt = new Date().toISOString();

  if (pkgsBody !== undefined) {
    Array.from(store.packages.values())
      .filter((p) => p.serviceId === service.id)
      .forEach((p) => store.packages.delete(p.id));

    pkgsBody.forEach((pkg, idx) => {
      const pkgId = pkg.id || uuidv4();
      store.packages.set(pkgId, {
        id: pkgId,
        serviceId: service.id,
        name: pkg.name,
        scope: pkg.scope,
        price: pkg.price,
        deliveryDays: pkg.deliveryDays,
        displayOrder: pkg.displayOrder || idx + 1,
      });
    });
  }

  const responseHeaders = {};
  if (service.status === 'PUBLISHED') {
    const currentPkgs = getServicePackages(service.id);
    const { valid: stillValid } = validatePublish(service, currentPkgs);
    if (!stillValid) {
      service.status = 'DRAFT';
      service.updatedAt = new Date().toISOString();
      responseHeaders['X-Auto-Unpublished'] = 'true';
    }
  }

  store.services.set(service.id, service);

  res.set(responseHeaders).json({
    ...service,
    packages: getServicePackages(service.id),
    images: getServiceImages(service.id),
  });
});

// DELETE /api/v1/services/:id
router.delete('/:id', auth, (req, res) => {
  const service = store.services.get(req.params.id);
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });
  if (service.freelancerId !== req.user.freelancerId) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }
  if (service.status === 'PUBLISHED') {
    return res.status(409).json({
      error: 'CONFLICT',
      message: 'No se puede eliminar un servicio publicado. Despublícalo primero.',
    });
  }

  Array.from(store.packages.values()).filter((p) => p.serviceId === service.id).forEach((p) => store.packages.delete(p.id));
  Array.from(store.images.values()).filter((i) => i.serviceId === service.id).forEach((i) => store.images.delete(i.id));
  store.services.delete(service.id);

  res.status(204).send();
});

// POST /api/v1/services/:id/publish
router.post('/:id/publish', auth, (req, res) => {
  const service = store.services.get(req.params.id);
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });
  if (service.freelancerId !== req.user.freelancerId) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }

  const packages = getServicePackages(service.id);
  const { valid, missing } = validatePublish(service, packages);
  if (!valid) {
    return res.status(422).json({
      error: 'PUBLISH_VALIDATION_FAILED',
      missing,
      message: 'El servicio no cumple los requisitos mínimos para publicarse.',
    });
  }

  service.status = 'PUBLISHED';
  service.updatedAt = new Date().toISOString();
  store.services.set(service.id, service);

  res.json({ ...service, packages, images: getServiceImages(service.id) });
});

// POST /api/v1/services/:id/unpublish
router.post('/:id/unpublish', auth, (req, res) => {
  const service = store.services.get(req.params.id);
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });
  if (service.freelancerId !== req.user.freelancerId) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }

  service.status = 'DRAFT';
  service.updatedAt = new Date().toISOString();
  store.services.set(service.id, service);

  res.json({
    ...service,
    packages: getServicePackages(service.id),
    images: getServiceImages(service.id),
  });
});

module.exports = router;
