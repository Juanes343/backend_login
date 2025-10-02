const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://estebancastaneda34734_db_userd:srUNI2MvNEhX7wLB@cluster0.8hnlkip.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('✅ Conectado exitosamente a MongoDB Atlas'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Usar rutas separadas
app.use('/api/registro', registerRoutes);
app.use('/api/login', loginRoutes);
app.use('/api', authRoutes); // Para mantener la ruta de test
app.use('/api/logs', logsRoutes); // Rutas para consultar logs

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});