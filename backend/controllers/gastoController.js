import Gasto from '../models/Gasto.js';
import Cuenta from '../models/Cuenta.js';

export const crearGasto = async (req, res) => {
  const { monto, fecha, descripcion, cuentaId, categoriaId } = req.body;

  if (!fecha) {
    return res.status(400).json({ mensaje: 'El campo fecha es obligatorio' });
  }

  const [year, month, day] = fecha.split('-').map(Number);
  const fechaFinal = new Date(year, month - 1, day, 12);

  try {
    const nuevoGasto = new Gasto({
      monto,
      fecha: fechaFinal,
      descripcion,
      categoriaId,
      cuentaId,
      autorId: req.usuario.id,
      grupoFamiliarId: req.usuario.grupoFamiliarId || null
    });

    await nuevoGasto.save();

    await Cuenta.findByIdAndUpdate(cuentaId, {
      $inc: { saldo: -monto }
    });

    res.status(201).json(nuevoGasto);
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({ mensaje: 'Error al crear el gasto' });
  }
};

export const obtenerGastosUsuario = async (req, res) => {
  try {
    const gastos = await Gasto.find({ autorId: req.usuario._id })
      .populate('categoriaId', 'nombre icono color')
      .populate('cuentaId', 'nombre tipoCuenta')
      .sort({ fecha: -1 });

    res.json(gastos);
  } catch (error) {
    console.error('Error al obtener los gastos del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener los gastos del usuario' });
  }
};


export const obtenerGastosPorGrupo = async (req, res) => {
  try {
    if (!req.usuario.grupoFamiliarId) {
      return res.status(400).json({ mensaje: 'El usuario no pertenece a un grupo familiar' });
    }

    const gastos = await Gasto.find({ grupoFamiliarId: req.usuario.grupoFamiliarId })
      .populate('categoriaId', 'nombre icono color')
      .populate('cuentaId', 'nombre tipoCuenta')
      .populate('autorId', 'nombre')
      .sort({ fecha: -1 });
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los gastos', error });
  }
};

export const estadisticasUsuario = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const filtro = {
      autorId: req.usuario._id
    };
    if (desde && hasta) {
      filtro.fecha = {
        $gte: new Date(desde),
        $lte: new Date(hasta)
      };
    }
    const resultados = await Gasto.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$categoriaId',
          total: { $sum: '$monto' }
        }
      },
      {
        $lookup: {
          from: 'categorias',
          localField: '_id',
          foreignField: '_id',
          as: 'categoria'
        }
      },
      { $unwind: '$categoria' },
      {
        $project: {
          _id: 0,
          categoria: '$categoria.nombre',
          color: '$categoria.color',
          total: 1
        }
      }
    ]);
    res.json(resultados);
  } catch (error) {
    console.error('Error en estadísticas de usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas del usuario' });
  }
};

export const estadisticasGrupo = async (req, res) => {
  try {
    if (!req.usuario.grupoFamiliarId) {
      return res.json([]);
    }
    const { desde, hasta } = req.query;
    const filtro = {
      grupoFamiliarId: req.usuario.grupoFamiliarId,
    };
    if (desde && hasta) {
      filtro.fecha = {
        $gte: new Date(desde),
        $lte: new Date(hasta),
      };
    }
    const resultados = await Gasto.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: {
            categoriaId: '$categoriaId',
            autorId: '$autorId',
          },
          total: { $sum: '$monto' },
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id.autorId',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $lookup: {
          from: 'categorias',
          localField: '_id.categoriaId',
          foreignField: '_id',
          as: 'categoria',
        },
      },
      { $unwind: '$categoria' },
      {
        $project: {
          _id: 0,
          categoria: '$categoria.nombre',
          total: 1,
          usuario: '$usuario.nombre',
        },
      },
    ]);
    res.json(resultados);
  } catch (error) {
    console.error('Error en estadísticas del grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const totalPorCategoria = async (req, res) => {
  try {
    const resultados = await Gasto.aggregate([
      { $match: { autorId: req.usuario._id } },
      {
        $group: {
          _id: '$categoriaId',
          total: { $sum: '$monto' }
        }
      }
    ]);
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener totales por categoría' });
  }
};

export const eliminarGasto = async (req, res) => {
  const { id } = req.params;
  try {
    const gasto = await Gasto.findById(id);
    if (!gasto) {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    if (gasto.autorId.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ mensaje: 'No tenés permiso para borrar este gasto' });
    }
    await Cuenta.findByIdAndUpdate(gasto.cuentaId, {
      $inc: { saldo: gasto.monto }
    });
    await Gasto.findByIdAndDelete(id);
    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el gasto' });
  }
};

export const editarGasto = async (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, fecha, cuentaId, categoriaId } = req.body;
  let fechaFinal = null;
  if (fecha) {
    const [year, month, day] = fecha.split('-').map(Number);
    fechaFinal = new Date(year, month - 1, day, 12);
  }
  try {
    const gastoExistente = await Gasto.findById(id);
    if (!gastoExistente) {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    if (gastoExistente.autorId.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ mensaje: 'No tenés permiso para editar este gasto' });
    }
    await Cuenta.findByIdAndUpdate(gastoExistente.cuentaId, {
      $inc: { saldo: gastoExistente.monto }
    });
    await Cuenta.findByIdAndUpdate(cuentaId, {
      $inc: { saldo: -monto }
    });
    gastoExistente.descripcion = descripcion;
    gastoExistente.monto = monto;
    gastoExistente.fecha = fechaFinal;
    gastoExistente.cuentaId = cuentaId;
    gastoExistente.categoriaId = categoriaId;
    await gastoExistente.save();

    res.json({ mensaje: 'Gasto actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar gasto:', error);
    res.status(500).json({ mensaje: 'Error al editar el gasto' });
  }
};




