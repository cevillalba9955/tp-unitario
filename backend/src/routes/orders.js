const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const store = require('../store');
const { STAGES, VALID_ACTIONS, TRANSITIONS, resolveTransition } = require('../domain/orderStateMachine');

const router = express.Router();

// Determina el rol del solicitante respecto de un pedido concreto.
function participantRole(order, userId) {
  if (order.freelancerId === userId) return 'freelancer';
  if (order.buyerId === userId) return 'buyer';
  return null;
}

// POST /api/v1/orders — Contratar (US1)
router.post('/', auth, (req, res) => {
  const { userId } = req.user;
  const { serviceId, packageId } = req.body || {};

  if (!serviceId || !packageId) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'serviceId y packageId son requeridos.' });
  }

  const service = store.services.get(serviceId);
  if (!service) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Servicio no encontrado.' });
  }
  if (service.status !== 'PUBLISHED') {
    return res.status(409).json({ error: 'CONFLICT', message: 'El servicio no está disponible para contratar.' });
  }

  const pkg = store.packages.get(packageId);
  if (!pkg) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Paquete no encontrado.' });
  }
  if (pkg.serviceId !== serviceId) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El paquete no pertenece al servicio.' });
  }

  // FR-003: un freelancer no puede contratar su propio servicio.
  if (service.freelancerId === userId) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'No podés contratar tus propios servicios.' });
  }

  const now = new Date().toISOString();
  const id = uuidv4();
  const order = {
    id,
    buyerId: userId,
    freelancerId: service.freelancerId,
    serviceId,
    packageId,
    // FR-005: copia inmutable del paquete al momento de contratar.
    packageSnapshot: {
      serviceTitle: service.title,
      packageName: pkg.name,
      price: pkg.price,
      deliveryDays: pkg.deliveryDays,
    },
    stage: STAGES.PENDIENTE, // FR-006
    history: [
      { from: null, to: STAGES.PENDIENTE, action: 'create', actorRole: 'buyer', actorId: userId, at: now },
    ],
    createdAt: now,
    updatedAt: now,
  };

  store.orders.set(id, order);
  res.status(201).json(order);
});

// GET /api/v1/orders — Mis pedidos (según el rol del token)
router.get('/', auth, (req, res) => {
  const { userId, role } = req.user;
  const all = Array.from(store.orders.values());

  const mine = role === 'freelancer'
    ? all.filter((o) => o.freelancerId === userId)
    : all.filter((o) => o.buyerId === userId);

  const data = mine.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ data });
});

// GET /api/v1/orders/:id — Detalle de pedido
router.get('/:id', auth, (req, res) => {
  const { userId } = req.user;
  const order = store.orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Pedido no encontrado.' });
  }
  if (!participantRole(order, userId)) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }
  res.json(order);
});

// POST /api/v1/orders/:id/transition — Avanzar/actuar sobre el pedido
router.post('/:id/transition', auth, (req, res) => {
  const { userId } = req.user;
  const { action } = req.body || {};

  if (!action || !VALID_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Acción desconocida o ausente.' });
  }

  const order = store.orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Pedido no encontrado.' });
  }

  const role = participantRole(order, userId);
  if (!role) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado.' });
  }

  const result = resolveTransition(order.stage, action, role);
  if (!result.ok) {
    // Si la acción existe para el rol pero no desde esta etapa -> 409 (transición inválida).
    // Si la acción no corresponde al rol en ninguna etapa -> 403 (rol incorrecto).
    const actionBelongsToRole = TRANSITIONS.some((t) => t.action === action && t.role === role);
    if (actionBelongsToRole) {
      return res.status(409).json({ error: 'CONFLICT', message: 'La acción no es válida para la etapa actual del pedido.' });
    }
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Tu rol no puede ejecutar esta acción.' });
  }

  const now = new Date().toISOString();
  order.history.push({ from: order.stage, to: result.to, action, actorRole: role, actorId: userId, at: now });
  order.stage = result.to;
  order.updatedAt = now;
  store.orders.set(order.id, order);

  res.json(order);
});

module.exports = router;
