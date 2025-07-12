import Usuario from '../models/Usuario.js';
import GrupoFamiliar from '../models/GrupoFamiliar.js';

export const crearGrupoFamiliar = async (req, res) => {
  try {
    const nuevoGrupo = new GrupoFamiliar({
      nombre: req.body.nombre,
      creadoPor: req.usuario._id,
    });
    await nuevoGrupo.save();

    await Usuario.findByIdAndUpdate(req.usuario._id, {
      grupoFamiliarId: nuevoGrupo._id,
      esAdminGrupo: true,
    });

    res.json({
      mensaje: 'Grupo creado con éxito',
      grupoFamiliarId: nuevoGrupo._id
    });
  } catch (err) {
    console.error('Error al crear grupo:', err);
    res.status(500).json({ mensaje: 'Error al crear grupo' });
  }
};

export const obtenerMiembrosGrupo = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id);
    if (!usuario.grupoFamiliarId) {
      return res.status(400).json({ mensaje: 'No pertenecés a un grupo' });
    }

    const miembros = await Usuario.find({ grupoFamiliarId: usuario.grupoFamiliarId }).populate('grupoFamiliarId');
    res.json(miembros);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener miembros', error });
  }
};
