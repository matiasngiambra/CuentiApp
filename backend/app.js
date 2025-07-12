import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import cuentaRoutes from './routes/cuentaRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import gastoRoutes from './routes/gastoRoutes.js';
import grupoFamiliarRoutes from './routes/grupoFamiliarRoutes.js';

const app = express();

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/cuentas', cuentaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/grupo', grupoFamiliarRoutes);
app.use('/api/usuarios', authRoutes); 

export default app;
