const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'freelancehub-dev-secret';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token de autenticación requerido.' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { userId: payload.userId || payload.sub || payload.id, role: payload.role || null };
    next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido o expirado.' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { userId: payload.userId || payload.sub || payload.id, role: payload.role || null };
  } catch {
    req.user = null;
  }
  next();
}

module.exports = auth;
module.exports.optionalAuth = optionalAuth;
