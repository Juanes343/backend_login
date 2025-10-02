const express = require('express');
const router = express.Router();
const { obtenerLogs, obtenerLogsPorUsuario, obtenerEstadisticas } = require('../controllers/logsController');

// Ruta para obtener todos los logs con filtros y paginación
// GET /api/logs?page=1&limit=20&userEmail=test@example.com&success=true&fechaInicio=2024-01-01&fechaFin=2024-12-31
router.get('/', obtenerLogs);

// Ruta para obtener estadísticas de logs
// GET /api/logs/estadisticas
router.get('/estadisticas', obtenerEstadisticas);

// Ruta para obtener logs de un usuario específico
// GET /api/logs/usuario/:userId?page=1&limit=10
router.get('/usuario/:userId', obtenerLogsPorUsuario);

module.exports = router;