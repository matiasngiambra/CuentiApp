import express from 'express';
import { crearGrupoFamiliar, obtenerMiembrosGrupo } from '../controllers/grupoFamiliarController.js';
import { protegerRuta } from '../middleware/authMiddleware.js';
import Usuario from '../models/Usuario.js';
import GrupoFamiliar from '../models/GrupoFamiliar.js';

const router = express.Router();

router.post('/', protegerRuta, crearGrupoFamiliar);

router.get('/miembros', protegerRuta, obtenerMiembrosGrupo);

// Ruta para invitar usuarios al grupo (solo admin)
router.post('/invitar', protegerRuta, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario._id);
    if (!admin || !admin.esAdminGrupo) {
      return res.status(403).json({ mensaje: 'Solo el administrador puede invitar usuarios' });
    }

    const { email } = req.body;
    const usuarioAInvitar = await Usuario.findOne({ email });
    if (!usuarioAInvitar) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // 🔍 Validar límite de integrantes
    const grupo = await GrupoFamiliar.findById(admin.grupoFamiliarId).populate('miembros');
    if (grupo.miembros.length >= 2) {
      return res.status(400).json({ mensaje: 'El grupo ya tiene el máximo de 2 integrantes' });
    }

    usuarioAInvitar.grupoFamiliarId = admin.grupoFamiliarId;
    await usuarioAInvitar.save();

    await GrupoFamiliar.findByIdAndUpdate(admin.grupoFamiliarId, {
      $addToSet: { miembros: usuarioAInvitar._id }
    });

    res.json({ mensaje: 'Usuario agregado al grupo familiar' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al invitar usuario' });
  }
});


// Eliminar grupo (solo admin)
router.delete('/', protegerRuta, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id);
    const grupoId = usuario.grupoFamiliarId;

    if (!grupoId) {
      return res.status(400).json({ mensaje: 'No pertenecés a ningún grupo' });
    }

    const grupo = await GrupoFamiliar.findById(grupoId);
    if (!grupo || grupo.creadoPor.toString() !== usuario._id.toString()) {
      return res.status(403).json({ mensaje: 'Solo el administrador puede eliminar el grupo' });
    }

    await GrupoFamiliar.findByIdAndDelete(grupoId);

    await Usuario.updateMany(
      { grupoFamiliarId: grupoId },
      { $unset: { grupoFamiliarId: "", esAdminGrupo: "" } }
    );

    res.json({ mensaje: 'Grupo familiar eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el grupo' });
  }
});

// Eliminar miembro del grupo (solo admin)
router.delete('/miembros/:id', protegerRuta, async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Usuario.findById(req.usuario._id);
    if (!admin || !admin.esAdminGrupo) {
      return res.status(403).json({ mensaje: 'Solo el administrador puede eliminar miembros' });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario || usuario.grupoFamiliarId?.toString() !== admin.grupoFamiliarId?.toString()) {
      return res.status(404).json({ mensaje: 'Usuario no pertenece a tu grupo' });
    }

    usuario.grupoFamiliarId = null;
    await usuario.save();

    await GrupoFamiliar.findByIdAndUpdate(admin.grupoFamiliarId, {
      $pull: { miembros: usuario._id }
    });

    res.json({ mensaje: 'Miembro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar miembro del grupo:', error);
    res.status(500).json({ mensaje: 'Error al eliminar miembro del grupo' });
  }
});

export default router;
