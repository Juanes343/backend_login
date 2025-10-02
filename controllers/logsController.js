const Log = require('../models/Log');

// Obtener todos los logs con paginación
const obtenerLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filtros opcionales
    const filtros = {};
    if (req.query.userId) filtros.userId = req.query.userId;
    if (req.query.userEmail) filtros.userEmail = { $regex: req.query.userEmail, $options: 'i' };
    if (req.query.success !== undefined) filtros.success = req.query.success === 'true';
    
    // Filtro por rango de fechas
    if (req.query.fechaInicio || req.query.fechaFin) {
      filtros.timestamp = {};
      if (req.query.fechaInicio) filtros.timestamp.$gte = new Date(req.query.fechaInicio);
      if (req.query.fechaFin) filtros.timestamp.$lte = new Date(req.query.fechaFin);
    }

    const logs = await Log.find(filtros)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'nombre email');

    const total = await Log.countDocuments(filtros);

    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

// Obtener logs de un usuario específico
const obtenerLogsPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Log.countDocuments({ userId });

    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLogs: total
      }
    });

  } catch (error) {
    console.error('Error al obtener logs del usuario:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

// Obtener estadísticas de logs
const obtenerEstadisticas = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioSemana = new Date(hoy.setDate(hoy.getDate() - 7));
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const estadisticas = {
      totalLogins: await Log.countDocuments({ success: true }),
      loginsFallidos: await Log.countDocuments({ success: false }),
      loginsHoy: await Log.countDocuments({ 
        success: true, 
        timestamp: { $gte: inicioHoy } 
      }),
      loginsSemana: await Log.countDocuments({ 
        success: true, 
        timestamp: { $gte: inicioSemana } 
      }),
      loginsMes: await Log.countDocuments({ 
        success: true, 
        timestamp: { $gte: inicioMes } 
      }),
      usuariosActivos: await Log.distinct('userId', { 
        success: true, 
        timestamp: { $gte: inicioSemana } 
      }).then(users => users.length)
    };

    res.json(estadisticas);

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  obtenerLogs,
  obtenerLogsPorUsuario,
  obtenerEstadisticas
};