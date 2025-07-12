import express from 'express';
import { crearGasto, obtenerGastosPorGrupo, totalPorCategoria, obtenerGastosUsuario  } from '../controllers/gastoController.js';
import { protegerRuta } from '../middleware/authMiddleware.js';
import { estadisticasUsuario, estadisticasGrupo } from '../controllers/gastoController.js';
import { editarGasto } from '../controllers/gastoController.js';
import { eliminarGasto } from '../controllers/gastoController.js';

const router = express.Router();

router.post('/', protegerRuta, crearGasto);
router.get('/', protegerRuta, obtenerGastosPorGrupo);
router.get('/usuario', protegerRuta, obtenerGastosUsuario);
router.get('/estadisticas/usuario', protegerRuta, estadisticasUsuario);
router.get('/estadisticas/grupo', protegerRuta, estadisticasGrupo);
router.get('/totales-por-categoria', protegerRuta, totalPorCategoria);
router.put('/:id', protegerRuta, editarGasto);
router.delete('/:id', protegerRuta, eliminarGasto);

export default router;
