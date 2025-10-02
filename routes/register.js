const express = require('express');
const registerController = require('../controllers/registerController');

const router = express.Router();

// Ruta de registro
router.post('/', registerController.registro);

module.exports = router;