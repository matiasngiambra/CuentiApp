import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Cuenta from '../models/Cuenta.js';
import Categoria from '../models/Categoria.js';

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registrarUsuario = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: 'El email ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({ nombre, email, password: hash });
    await nuevoUsuario.save();
    await Cuenta.insertMany([
      {
        nombre: 'Dinero en efectivo',
        saldo: 0,
        tipoCuenta: 'efectivo',
        autorId: nuevoUsuario._id
      },
      {
        nombre: 'Cuenta bancaria',
        saldo: 0,
        tipoCuenta: 'cuenta',
        autorId: nuevoUsuario._id
      }
    ]);
    await Categoria.insertMany([
      {
        nombre: 'Comida',
        color: '#f87171',
        icono: '🍔',
        autorId: nuevoUsuario._id,
      },
      {
        nombre: 'Transporte',
        color: '#60a5fa',
        icono: '🚗',
        autorId: nuevoUsuario._id,
      },
      {
        nombre: 'Hogar',
        color: '#34d399',
        icono: '🏠',
        autorId: nuevoUsuario._id,
      },
      {
        nombre: 'Salud',
        color: '#fbbf24',
        icono: '🩺',
        autorId: nuevoUsuario._id,
      }
    ]);

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario: {
        _id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
      },
      token: generarToken(nuevoUsuario._id),
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        mensaje: 'Error de validación',
        errores: error.errors
      });
    }
    res.status(500).json({ mensaje: 'Error en el registro', error });
  }
};


export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const passwordOK = await bcrypt.compare(password, usuario.password);
    if (!passwordOK) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    res.json({
      mensaje: 'Login exitoso',
      token: generarToken(usuario._id),
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        grupoFamiliarId: usuario.grupoFamiliarId,
        esAdminGrupo: usuario.esAdminGrupo
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el login', error });
  }
};

export const cambiarPassword = async (req, res) => {
  const { actual, nueva } = req.body;

  try {
    const usuario = await Usuario.findById(req.usuario._id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const passwordValida = await bcrypt.compare(actual, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    const nuevaPasswordHasheada = await bcrypt.hash(nueva, salt);

    usuario.password = nuevaPasswordHasheada;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id).select('nombre email');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener el perfil' });
  }
};

