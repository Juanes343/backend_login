const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  nombre: String,
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precio: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;