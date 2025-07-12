import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const protegerRuta = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(decoded.id).select('-password');
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Token válido pero usuario no encontrado' });
        }
        req.usuario = usuario;
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({ mensaje: 'Token inválido' });
    }
};
