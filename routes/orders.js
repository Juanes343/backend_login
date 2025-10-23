const express = require('express');
const router = express.Router();
const {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  obtenerPedidosPorUsuario
} = require('../controllers/ordersController');

/**
 * Ruta para crear un nuevo pedido
 * POST /api/orders
 * Body: { usuarioId, items: [{ productoId, cantidad }] }
 */
router.post('/', crearPedido);

/**
 * Ruta para obtener todos los pedidos (con paginación y filtros)
 * GET /api/orders?page=1&limit=10&usuarioId=xxx&estado=pendiente
 */
router.get('/', obtenerPedidos);

/**
 * Ruta para obtener pedidos de un usuario específico
 * GET /api/orders/usuario/:usuarioId?page=1&limit=10
 */
router.get('/usuario/:usuarioId', obtenerPedidosPorUsuario);

/**
 * Ruta para obtener un pedido específico por ID
 * GET /api/orders/:id
 */
router.get('/:id', obtenerPedidoPorId);

/**
 * Ruta para actualizar el estado de un pedido
 * PUT /api/orders/:id/estado
 * Body: { estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado' }
 */
router.put('/:id/estado', actualizarEstadoPedido);

// ===== RUTAS LEGACY (mantenidas para compatibilidad) =====

/**
 * Ruta legacy para obtener pedidos del usuario autenticado
 * GET /api/orders/mis-pedidos
 * Requiere autenticación via middleware
 */
router.get('/mis-pedidos', async (req, res) => {
  try {
    // Verificar si hay usuario autenticado (middleware de autenticación)
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }
    
    // Usar el controlador para obtener pedidos del usuario
    req.params.usuarioId = userId;
    return obtenerPedidosPorUsuario(req, res);
    
  } catch (error) {
    console.error('Error en ruta mis-pedidos:', error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
});

/**
 * Ruta legacy para crear pedido con usuario autenticado
 * POST /api/orders/crear-con-auth
 * Requiere autenticación via middleware
 */
router.post('/crear-con-auth', async (req, res) => {
  try {
    // Verificar si hay usuario autenticado
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    // Agregar el usuarioId al body y usar el controlador
    req.body.usuarioId = userId;
    return crearPedido(req, res);
    
  } catch (error) {
    console.error('Error en ruta crear-con-auth:', error);
    res.status(500).json({ mensaje: 'Error al crear pedido', error: error.message });
  }
});
module.exports = router;