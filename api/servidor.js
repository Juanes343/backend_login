const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar rutas con rutas relativas correctas
const registerRoutes = require('../routes/register');
const loginRoutes = require('../routes/login');
const authRoutes = require('../routes/auth');
const logsRoutes = require('../routes/logs');
const productsRoutes = require('../routes/products');
const ordersRoutes = require('../routes/orders');

const app = express();

// Middlewares básicos
app.use(cors({
  origin: ['https://frontend-login-gilt.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Variable para controlar la conexión
let isConnected = false;

// Función para conectar a MongoDB
const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    console.log('Intentando conectar a MongoDB Atlas...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://estebancastaneda34734_db_userd:aAXL2Bm3S97hAMAC@cluster0.8hnlkip.mongodb.net/web2?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Aumentar el timeout a 30 segundos
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ Conectado exitosamente a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    console.warn('⚠️ La aplicación continuará funcionando sin conexión a la base de datos');
    // No lanzamos el error para que la aplicación continúe funcionando
  }
};

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    mensaje: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'OK',
    dbConnected: isConnected,
    dbStatus: isConnected ? 'conectado' : 'desconectado'
  });
});

// Middleware para verificar conexión a la base de datos
app.use((req, res, next) => {
  if (!isConnected && req.path !== '/api') {
    return res.status(503).json({
      mensaje: 'Base de datos no disponible. Por favor, intenta más tarde.',
      error: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
});

// Ruta raíz con mensaje amigable
app.get('/', (req, res) => {
  res.json({ 
    mensaje: '🚀 Backend de Login ejecutándose correctamente',
    descripcion: 'API REST para autenticación de usuarios',
    endpoints: {
      login: '/api/login',
      registro: '/api/registro',
      auth: '/api/auth',
      logs: '/api/logs'
    },
    timestamp: new Date().toISOString(),
    status: 'ONLINE'
  });
});

// Usar las rutas importadas
app.use('/api/registro', registerRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/productos', productsRoutes);
app.use('/api/pedidos', ordersRoutes);

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message 
  });
});

// Función principal para Vercel
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Error en función serverless:', error);
    return res.status(500).json({ 
      error: 'Error de conexión a la base de datos',
      message: error.message 
    });
  }
};

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}