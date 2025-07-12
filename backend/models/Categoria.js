import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  icono: { type: String },
  color: { type: String },
  grupoFamiliarId: { type: mongoose.Schema.Types.ObjectId, ref: 'GrupoFamiliar', required: false },
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }

}, { timestamps: true });

export default mongoose.model('Categoria', categoriaSchema);
