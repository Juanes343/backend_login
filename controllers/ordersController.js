const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Crear un nuevo pedido
 * Recibe los datos del carrito y crea un pedido en la base de datos
 */
const crearPedido = async (req, res) => {
  try {
    const { usuarioId, items } = req.body;

    // Validar que se proporcionen los datos necesarios
    if (!usuarioId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        mensaje: 'Usuario e items del carrito son obligatorios' 
      });
    }

    // Validar que usuarioId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).json({ 
        mensaje: 'ID de usuario inválido' 
      });
    }

    // Verificar que el usuario existe
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ 
        mensaje: 'Usuario no encontrado' 
      });
    }

    // Validar y procesar cada item del carrito
    const itemsProcesados = [];
    let totalPedido = 0;

    for (const item of items) {
      // Validar estructura del item
      if (!item.productoId || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({ 
          mensaje: 'Cada item debe tener productoId y cantidad válida' 
        });
      }

      // Buscar el producto en la base de datos
      const producto = await Product.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ 
          mensaje: `Producto con ID ${item.productoId} no encontrado` 
        });
      }

      // Verificar stock disponible
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para ${producto.nombre}. Stock disponible: ${producto.stock}` 
        });
      }

      // Calcular subtotal del item
      const subtotal = producto.precio * item.cantidad;
      totalPedido += subtotal;

      // Agregar item procesado
      itemsProcesados.push({
        producto: producto._id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio: producto.precio
      });
    }

    // Crear el nuevo pedido
    const nuevoPedido = new Order({
      usuario: usuarioId,
      items: itemsProcesados,
      total: totalPedido,
      estado: 'pendiente'
    });

    // Guardar el pedido en la base de datos
    await nuevoPedido.save();

    // Actualizar el stock de los productos
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productoId,
        { $inc: { stock: -item.cantidad } }, // Decrementar stock
        { new: true }
      );
    }

    // Poblar los datos del pedido para la respuesta
    const pedidoCompleto = await Order.findById(nuevoPedido._id)
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre precio');

    res.status(201).json({
      mensaje: 'Pedido creado exitosamente',
      pedido: pedidoCompleto
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener todos los pedidos con paginación
 * Permite filtrar por usuario y estado
 */
const obtenerPedidos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros opcionales
    const filtros = {};
    if (req.query.usuarioId) filtros.usuario = req.query.usuarioId;
    if (req.query.estado) filtros.estado = req.query.estado;

    // Obtener pedidos con paginación
    const pedidos = await Order.find(filtros)
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre precio')
      .sort({ createdAt: -1 }) // Más recientes primero
      .skip(skip)
      .limit(limit);

    // Contar total de pedidos para paginación
    const total = await Order.countDocuments(filtros);

    res.json({
      pedidos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPedidos: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener un pedido específico por ID
 */
const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el pedido por ID
    const pedido = await Order.findById(id)
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre precio descripcion');

    if (!pedido) {
      return res.status(404).json({ 
        mensaje: 'Pedido no encontrado' 
      });
    }

    res.json(pedido);

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

/**
 * Actualizar el estado de un pedido
 */
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'procesando', 'completado', 'cancelado'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        mensaje: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ') 
      });
    }

    // Actualizar el pedido
    const pedidoActualizado = await Order.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    ).populate('usuario', 'nombre email')
     .populate('items.producto', 'nombre precio');

    if (!pedidoActualizado) {
      return res.status(404).json({ 
        mensaje: 'Pedido no encontrado' 
      });
    }

    res.json({
      mensaje: 'Estado del pedido actualizado exitosamente',
      pedido: pedidoActualizado
    });

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener pedidos de un usuario específico
 */
const obtenerPedidosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validar que usuarioId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).json({ 
        mensaje: 'ID de usuario inválido' 
      });
    }

    // Verificar que el usuario existe
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ 
        mensaje: 'Usuario no encontrado' 
      });
    }

    // Obtener pedidos del usuario
    const pedidos = await Order.find({ usuario: usuarioId })
      .populate('items.producto', 'nombre precio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ usuario: usuarioId });

    res.json({
      pedidos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPedidos: total
      }
    });

  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

// Exportar todas las funciones del controlador
module.exports = {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  obtenerPedidosPorUsuario
};