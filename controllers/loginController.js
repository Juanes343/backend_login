const User = require('../models/User');
const Log = require('../models/Log');

// Función auxiliar para registrar logs
const registrarLog = async (userId, userEmail, userName, success, details, req) => {
  try {
    const logData = {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      action: 'login',
      success: success,
      details: details,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    };

    const log = new Log(logData);
    await log.save();
    console.log(`Log registrado: ${success ? 'Login exitoso' : 'Login fallido'} para ${userEmail}`);
  } catch (error) {
    console.error('Error al registrar log:', error);
    // No interrumpimos el flujo principal si falla el log
  }
};

// Controller para el login de usuarios
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        mensaje: 'Email y contraseña son obligatorios' 
      });
    }

    // Buscar usuario
    const usuario = await User.findOne({ email });
    if (!usuario) {
      // Registrar intento de login fallido
      await registrarLog(null, email, 'Usuario no encontrado', false, 'Usuario no existe', req);
      
      return res.status(401).json({ 
        mensaje: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      // Registrar intento de login fallido
      await registrarLog(usuario._id, usuario.email, usuario.nombre, false, 'Contraseña incorrecta', req);
      
      return res.status(401).json({ 
        mensaje: 'Credenciales inválidas' 
      });
    }

    // Registrar login exitoso
    await registrarLog(usuario._id, usuario.email, usuario.nombre, true, 'Login exitoso', req);

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  login
};