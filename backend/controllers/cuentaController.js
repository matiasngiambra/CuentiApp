import Cuenta from '../models/Cuenta.js';

export const crearCuenta = async (req, res) => {
  try {
    const { nombre, saldo, tipoCuenta } = req.body;
    const cantidad = await Cuenta.countDocuments({ autorId: req.usuario._id });
    if (cantidad >= 3) {
      return res.status(400).json({ mensaje: 'No podés tener más de 3 cuentas' });
    }
    const cuenta = new Cuenta({
      nombre,
      saldo,
      tipoCuenta,
      grupoFamiliarId: req.usuario.grupoFamiliarId,
      autorId: req.usuario._id
    });

    const cuentaGuardada = await cuenta.save();
    res.status(201).json(cuentaGuardada);
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ mensaje: 'Error al crear la cuenta', error });
  }
};

export const obtenerCuentas = async (req, res) => {
  try {
    const cuentas = await Cuenta.find({ autorId: req.usuario._id }).sort({ createdAt: -1 });
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las cuentas', error });
  }
};

export const actualizarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findOne({ _id: req.params.id, autorId: req.usuario._id });
    if (!cuenta) return res.status(404).json({ mensaje: 'Cuenta no encontrada' });

    cuenta.nombre = req.body.nombre ?? cuenta.nombre;
    cuenta.tipoCuenta = req.body.tipoCuenta ?? cuenta.tipoCuenta;
    cuenta.saldo = req.body.saldo ?? cuenta.saldo;

    const cuentaActualizada = await cuenta.save();
    res.json(cuentaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la cuenta', error });
  }
};

export const eliminarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findOneAndDelete({ _id: req.params.id, autorId: req.usuario._id });
    if (!cuenta) return res.status(404).json({ mensaje: 'Cuenta no encontrada' });

    res.json({ mensaje: 'Cuenta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la cuenta', error });
  }
};
