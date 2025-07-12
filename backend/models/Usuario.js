import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  grupoFamiliarId: { type: mongoose.Schema.Types.ObjectId, ref: 'GrupoFamiliar', default: null },
  esAdminGrupo: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Usuario', usuarioSchema);
