/**
 * Rutas de Productos - Maneja todas las operaciones relacionadas con productos
 * 
 * Este archivo define las rutas REST para gestionar productos en el sistema,
 * incluyendo operaciones de lectura, creación, actualización y eliminación.
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importa el modelo de producto

/**
 * GET /api/productos
 * Obtiene todos los productos disponibles (con stock > 0)
 * 
 * Esta ruta filtra automáticamente los productos sin stock para mostrar
 * solo aquellos disponibles para la compra en el frontend.
 * 
 * @returns {Array} Lista de productos con stock disponible
 */
router.get('/', async (req, res) => {
  try {
    // Filtrar solo productos con stock mayor a 0 para evitar mostrar productos agotados
    const products = await Product.find({ stock: { $gt: 0 } });
    res.json(products);
  } catch (error) {
    // Manejo de errores con mensaje descriptivo
    res.status(500).json({ 
      mensaje: 'Error al obtener productos', 
      error: error.message 
    });
  }
});

/**
 * GET /api/productos/:id
 * Obtiene un producto específico por su ID
 * 
 * @param {string} id - ID único del producto en MongoDB
 * @returns {Object} Datos del producto solicitado
 */
router.get('/:id', async (req, res) => {
  try {
    // Busca el producto por ID en la base de datos
    const product = await Product.findById(req.params.id);
    
    // Verifica si el producto existe
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    // Manejo de errores (ej: ID inválido)
    res.status(500).json({ 
      mensaje: 'Error al obtener el producto', 
      error: error.message 
    });
  }
});

/**
 * POST /api/productos
 * Crea un nuevo producto en el sistema
 * 
 * Esta ruta está diseñada para administradores que necesiten agregar
 * nuevos productos al catálogo.
 * 
 * @body {Object} Datos del producto (nombre, descripcion, precio, stock, categoria, imagen)
 * @returns {Object} Producto creado con su ID asignado
 */
router.post('/', async (req, res) => {
  try {
    // Crea una nueva instancia del producto con los datos recibidos
    const product = new Product(req.body);
    
    // Guarda el producto en la base de datos
    await product.save();
    
    // Responde con el producto creado (código 201 = Created)
    res.status(201).json(product);
  } catch (error) {
    // Manejo de errores de validación o base de datos
    res.status(400).json({ 
      mensaje: 'Error al crear el producto', 
      error: error.message 
    });
  }
});

/**
 * PUT /api/productos/:id
 * Actualiza un producto existente
 * 
 * Esta ruta permite modificar cualquier campo del producto,
 * útil para actualizar precios, stock, descripciones, etc.
 * 
 * @param {string} id - ID del producto a actualizar
 * @body {Object} Campos del producto a modificar
 * @returns {Object} Producto actualizado
 */
router.put('/:id', async (req, res) => {
  try {
    // Busca y actualiza el producto, devolviendo la versión actualizada
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Opción para devolver el documento actualizado
    );
    
    // Verifica si el producto existe
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    // Manejo de errores de validación o base de datos
    res.status(400).json({ 
      mensaje: 'Error al actualizar el producto', 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/productos/:id
 * Elimina un producto del sistema
 * 
 * Esta operación es irreversible y debe usarse con precaución.
 * Recomendado solo para administradores.
 * 
 * @param {string} id - ID del producto a eliminar
 * @returns {Object} Mensaje de confirmación
 */
router.delete('/:id', async (req, res) => {
  try {
    // Busca y elimina el producto
    const product = await Product.findByIdAndDelete(req.params.id);
    
    // Verifica si el producto existía
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Confirma la eliminación
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ 
      mensaje: 'Error al eliminar el producto', 
      error: error.message 
    });
  }
});

// Exporta el router para ser usado en el servidor principal
module.exports = router;