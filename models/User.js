/**
 * Modelo de Usuario - Define la estructura y comportamiento de los usuarios en la base de datos
 * 
 * Este modelo utiliza Mongoose para definir el esquema de usuarios con validaciones,
 * encriptación de contraseñas y métodos auxiliares para la autenticación.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas

/**
 * Esquema de Usuario
 * Define la estructura de datos para los usuarios en MongoDB
 */
const userSchema = new mongoose.Schema({
  // Nombre del usuario - campo obligatorio con validaciones
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'], // Validación de campo requerido
    trim: true, // Elimina espacios en blanco al inicio y final
    maxlength: [50, 'El nombre no puede exceder 50 caracteres'] // Límite de caracteres
  },
  
  // Email del usuario - campo único e identificador principal
  email: {
    type: String,
    required: [true, 'El email es obligatorio'], // Campo requerido
    unique: true, // Garantiza que no haya emails duplicados
    lowercase: true, // Convierte automáticamente a minúsculas
    trim: true, // Elimina espacios en blanco
    // Validación de formato de email usando expresión regular
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  
  // Contraseña del usuario - se almacena encriptada
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'], // Campo requerido
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'] // Longitud mínima
  }
}, {
  // Opciones del esquema
  timestamps: true // Agrega automáticamente campos createdAt y updatedAt
});

/**
 * Middleware pre-save: Encripta la contraseña antes de guardar en la base de datos
 * 
 * Este middleware se ejecuta automáticamente antes de guardar un usuario.
 * Solo encripta la contraseña si ha sido modificada (nueva o actualizada).
 */
userSchema.pre('save', async function(next) {
  // Si la contraseña no ha sido modificada, continúa sin encriptar
  if (!this.isModified('password')) return next();
  
  try {
    // Genera un "salt" (valor aleatorio) para hacer la encriptación más segura
    const salt = await bcrypt.genSalt(10); // 10 rondas de encriptación
    
    // Encripta la contraseña usando el salt generado
    this.password = await bcrypt.hash(this.password, salt);
    
    next(); // Continúa con el proceso de guardado
  } catch (error) {
    next(error); // Si hay error, lo pasa al siguiente middleware
  }
});

/**
 * Método de instancia: Compara una contraseña en texto plano con la encriptada
 * 
 * @param {string} passwordIngresada - Contraseña en texto plano a verificar
 * @returns {Promise<boolean>} - true si las contraseñas coinciden, false si no
 * 
 * Este método se usa durante el login para verificar si la contraseña
 * ingresada por el usuario coincide con la almacenada en la base de datos.
 */
userSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Exporta el modelo User para ser usado en otras partes de la aplicación
module.exports = mongoose.model('User', userSchema);