import mongoose from 'mongoose';

const gastoSchema = new mongoose.Schema({
  monto: { type: Number, required: true },
  fecha: { type: Date, required: true },
  descripcion: { type: String },
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  cuentaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta', required: true },
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  grupoFamiliarId: { type: mongoose.Schema.Types.ObjectId, ref: 'GrupoFamiliar', required: false }
}, { timestamps: true });

export default mongoose.model('Gasto', gastoSchema);
