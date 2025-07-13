import dotenv from 'dotenv';
import { conectarDB } from './config/db.js';
import app from './app.js';

dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI); // <-- Línea para testear

// Conectar a MongoDB
conectarDB();

// Levantar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
