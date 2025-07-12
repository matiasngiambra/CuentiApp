import Categoria from '../models/Categoria.js';
import Gasto from '../models/Gasto.js';

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ autorId: req.usuario._id }).sort({ createdAt: -1 });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error });
  }
};

export const crearCategoria = async (req, res) => {
  const { nombre, icono, color } = req.body;

  try {
    const nuevaCategoria = new Categoria({
      nombre,
      icono,
      color,
      autorId: req.usuario._id,
      grupoFamiliarId: req.usuario.grupoFamiliarId
    });

    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ mensaje: 'Error al crear categoría', error });
  }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findOne({ _id: req.params.id, autorId: req.usuario._id });
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });

    categoria.nombre = req.body.nombre ?? categoria.nombre;
    categoria.icono = req.body.icono ?? categoria.icono;
    categoria.color = req.body.color ?? categoria.color;

    const actualizada = await categoria.save();
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error });
  }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const eliminada = await Categoria.findOneAndDelete({
      _id: req.params.id,
      autorId: req.usuario._id
    });

    if (!eliminada) return res.status(404).json({ mensaje: 'Categoría no encontrada' });

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error });
  }
};

export const obtenerCategoriaPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id)
      .populate('autorId', 'nombre')
      .populate('grupoFamiliarId', 'nombre')
      .lean();

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    const gastos = await Gasto.find({ categoriaId: categoria._id })
      .populate('cuentaId', 'nombre tipoCuenta')
      .populate('autorId', 'nombre');

    const total = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);

    res.json({ ...categoria, gastos, total });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ mensaje: 'Error al obtener la categoría' });
  }
};

