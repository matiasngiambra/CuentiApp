import express from 'express';
import { protegerRuta } from '../middleware/authMiddleware.js';
import {
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria,
  eliminarCategoria,
  obtenerCategoriaPorId
} from '../controllers/categoriaController.js';

const router = express.Router();

router.get('/', protegerRuta, obtenerCategorias);
router.post('/', protegerRuta, crearCategoria);
router.put('/:id', protegerRuta, actualizarCategoria);
router.delete('/:id', protegerRuta, eliminarCategoria);
router.get('/:id', protegerRuta, obtenerCategoriaPorId);

export default router;
