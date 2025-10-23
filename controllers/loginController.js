/**
 * Controlador de Login - Maneja la autenticación de usuarios
 * 
 * Este controlador gestiona el proceso de inicio de sesión, incluyendo
 * validaciones, verificación de credenciales y registro de logs de seguridad.
 */

const User = require('../models/User'); // Modelo de usuario
const Log = require('../models/Log'); // Modelo para logs de seguridad

/**
 * Función auxiliar para registrar logs de actividad
 * 
 * Registra todos los intentos de login (exitosos y fallidos) para
 * propósitos de seguridad y auditoría del sistema.
 * 
 * @param {string|null} userId - ID del usuario (null si no se encuentra)
 * @param {string} userEmail - Email del usuario que intenta hacer login
 * @param {string} userName - Nombre del usuario (si existe)
 * @param {boolean} success - Si el login fue exitoso o no
 * @param {string} details - Detalles adicionales del intento
 * @param {Object} req - Objeto request de Express para obtener IP y User-Agent
 */
const registrarLog = async (userId, userEmail, userName, success, details, req) => {
  try {
    // Prepara los datos del log con información de seguridad
    const logData = {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      action: 'login', // Tipo de acción realizada
      success: success, // Resultado del intento
      details: details, // Información adicional
      // Información de seguridad para rastrear intentos sospechosos
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    };

    // Crea y guarda el log en la base de datos
    const log = new Log(logData);
    await log.save();
    
    // Log en consola para monitoreo en tiempo real
    console.log(`Log registrado: ${success ? 'Login exitoso' : 'Login fallido'} para ${userEmail}`);
  } catch (error) {
    // Si falla el registro del log, no interrumpe el flujo principal
    console.error('Error al registrar log:', error);
    // No lanzamos el error para que el login continúe funcionando
  }
};

/**
 * Controlador principal para el login de usuarios
 * 
 * Procesa las credenciales del usuario, valida la información,
 * verifica la contraseña y registra la actividad.
 * 
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 */
const login = async (req, res) => {
  try {
    // Extrae las credenciales del cuerpo de la petición
    const { email, password } = req.body;

    // Validaciones básicas de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        mensaje: 'Email y contraseña son obligatorios' 
      });
    }

    // Busca el usuario en la base de datos por email
    const usuario = await User.findOne({ email });
    
    // Si el usuario no existe
    if (!usuario) {
      // Registra el intento fallido para seguridad
      await registrarLog(null, email, 'Usuario no encontrado', false, 'Usuario no existe', req);
      
      // Respuesta genérica para no revelar si el email existe o no
      return res.status(401).json({ 
        mensaje: 'Credenciales inválidas' 
      });
    }

    // Verifica la contraseña usando el método del modelo User
    const passwordValida = await usuario.compararPassword(password);
    
    // Si la contraseña es incorrecta
    if (!passwordValida) {
      // Registra el intento fallido con información del usuario
      await registrarLog(usuario._id, usuario.email, usuario.nombre, false, 'Contraseña incorrecta', req);
      
      // Respuesta genérica para no revelar detalles específicos
      return res.status(401).json({ 
        mensaje: 'Credenciales inválidas' 
      });
    }

    // Si llegamos aquí, el login es exitoso
    // Registra el login exitoso en los logs
    await registrarLog(usuario._id, usuario.email, usuario.nombre, true, 'Login exitoso', req);

    // Responde con los datos del usuario (sin la contraseña)
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
        // Nota: Nunca incluir la contraseña en la respuesta
      }
    });

  } catch (error) {
    // Manejo de errores inesperados
    console.error('Error en login:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor' 
    });
  }
};

// Exporta el controlador para ser usado en las rutas
module.exports = {
  login
};