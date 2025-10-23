/**
 * Modelo de Producto - Define la estructura de los productos en el sistema de e-commerce
 * 
 * Este modelo gestiona la información de productos disponibles para la venta,
 * incluyendo validaciones de stock, precios y datos básicos del producto.
 */

const mongoose = require('mongoose');

/**
 * Esquema de Producto
 * Define la estructura de datos para los productos en MongoDB
 */
const productSchema = new mongoose.Schema({
  // Nombre del producto - identificador principal para el usuario
  nombre: {
    type: String,
    required: true, // Campo obligatorio
    trim: true // Elimina espacios en blanco al inicio y final
  },
  
  // Descripción detallada del producto
  descripcion: {
    type: String,
    required: true // Campo obligatorio para proporcionar información del producto
  },
  
  // Precio del producto en la moneda local
  precio: {
    type: Number,
    required: true, // Campo obligatorio
    min: 0 // El precio no puede ser negativo
  },
  
  // Cantidad disponible en inventario
  stock: {
    type: Number,
    required: true, // Campo obligatorio para control de inventario
    min: 0, // El stock no puede ser negativo
    default: 0 // Valor por defecto cuando se crea un producto
  },
  
  // URL de la imagen del producto
  imagen: {
    type: String,
    // Imagen por defecto si no se proporciona una específica
    default: 'https://via.placeholder.com/150'
  },
  
  // Categoría del producto para organización y filtrado
  categoria: {
    type: String,
    required: true // Campo obligatorio para clasificación
  },
  
  // Fecha de creación del producto
  createdAt: {
    type: Date,
    default: Date.now // Se establece automáticamente al momento de creación
  }
});

/**
 * Crea el modelo Product basado en el esquema definido
 * Este modelo se usa para realizar operaciones CRUD en la colección de productos
 */
const Product = mongoose.model('Product', productSchema);

// Exporta el modelo para ser usado en controladores y rutas
module.exports = Product;