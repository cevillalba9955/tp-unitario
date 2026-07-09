// Máquina de estados del ciclo de vida de un Pedido (feature 006-order-tracking).
// Fuente de verdad única de las transiciones válidas; los endpoints no deben duplicar reglas.

const STAGES = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  EN_REVISION: 'EN_REVISION',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
};

const FINAL_STAGES = new Set([STAGES.ENTREGADO, STAGES.CANCELADO]);

// Tabla declarativa: (stage, action, actorRole) -> nextStage
// Ver specs/006-order-tracking/data-model.md
const TRANSITIONS = [
  { from: STAGES.PENDIENTE,   action: 'accept',          role: 'freelancer', to: STAGES.CONFIRMADO },
  { from: STAGES.PENDIENTE,   action: 'reject',          role: 'freelancer', to: STAGES.CANCELADO },
  { from: STAGES.PENDIENTE,   action: 'cancel',          role: 'buyer',      to: STAGES.CANCELADO },
  { from: STAGES.CONFIRMADO,  action: 'deliver',         role: 'freelancer', to: STAGES.EN_REVISION },
  { from: STAGES.CONFIRMADO,  action: 'cancel',          role: 'buyer',      to: STAGES.CANCELADO },
  { from: STAGES.EN_REVISION, action: 'accept_delivery', role: 'buyer',      to: STAGES.ENTREGADO },
  { from: STAGES.EN_REVISION, action: 'request_changes', role: 'buyer',      to: STAGES.CONFIRMADO },
  { from: STAGES.EN_REVISION, action: 'cancel',          role: 'buyer',      to: STAGES.CANCELADO },
];

const VALID_ACTIONS = new Set(TRANSITIONS.map((t) => t.action));

function isFinal(stage) {
  return FINAL_STAGES.has(stage);
}

// Devuelve { ok: true, to } si la transición es válida para (stage, action, role);
// si no, { ok: false, reason: 'UNKNOWN_ACTION' | 'INVALID_TRANSITION' }.
function resolveTransition(stage, action, actorRole) {
  if (!VALID_ACTIONS.has(action)) {
    return { ok: false, reason: 'UNKNOWN_ACTION' };
  }
  const match = TRANSITIONS.find(
    (t) => t.from === stage && t.action === action && t.role === actorRole
  );
  if (!match) {
    return { ok: false, reason: 'INVALID_TRANSITION' };
  }
  return { ok: true, to: match.to };
}

module.exports = { STAGES, FINAL_STAGES, TRANSITIONS, VALID_ACTIONS, isFinal, resolveTransition };
