const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();

// Ruta de login
router.post('/', loginController.login);

module.exports = router;