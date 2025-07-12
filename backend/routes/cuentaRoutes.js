import express from 'express';
import {
  crearCuenta,
  obtenerCuentas,
  actualizarCuenta,
  eliminarCuenta
} from '../controllers/cuentaController.js';
import { protegerRuta } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protegerRuta, crearCuenta);
router.get('/', protegerRuta, obtenerCuentas);
router.put('/:id', protegerRuta, actualizarCuenta);
router.delete('/:id', protegerRuta, eliminarCuenta);

export default router;
