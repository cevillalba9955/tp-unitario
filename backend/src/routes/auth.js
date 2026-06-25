const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const store = require('../store');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'freelancehub-dev-secret';
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Email y contraseña requeridos.' });
  }

  const user = store.users.get(email);
  if (!user || user.passwordHash !== sha256(password)) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos.' });
  }

  const { role: expectedRole } = req.body;
  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({ error: 'ROLE_MISMATCH', message: 'Las credenciales no corresponden a este tipo de cuenta.' });
  }

  const token = jwt.sign(
    { userId: user.id, sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, userId: user.id, role: user.role, expiresIn: '7d' });
});

module.exports = router;
