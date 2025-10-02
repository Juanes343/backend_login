const express = require('express');

const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ mensaje: 'API funcionando correctamente' });
});

module.exports = router;