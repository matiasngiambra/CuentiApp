import express from 'express';
import { registrarUsuario, loginUsuario, cambiarPassword, obtenerPerfil} from '../controllers/authController.js';
import { protegerRuta } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/cambiar-password', protegerRuta, cambiarPassword);
router.get('/perfil', protegerRuta, obtenerPerfil);

export default router;
