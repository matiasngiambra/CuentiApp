import mongoose from 'mongoose';

const cuentaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  saldo: { type: Number, required: true, default: 0 },
  grupoFamiliarId: { type: mongoose.Schema.Types.ObjectId, ref: 'GrupoFamiliar', required: false },
  tipoCuenta: { type: String, enum: ['efectivo', 'cuenta', 'virtual'], required: true },
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }

}, { timestamps: true });

export default mongoose.model('Cuenta', cuentaSchema);
