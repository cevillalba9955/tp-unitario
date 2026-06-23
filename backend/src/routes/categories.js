const express = require('express');
const store = require('../store');

const router = express.Router();

router.get('/', (req, res) => {
  const categories = Array.from(store.categories.values());
  res.json(categories);
});

module.exports = router;
