import mongoose from 'mongoose';

const grupoFamiliarSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }]
});

const GrupoFamiliar = mongoose.model('GrupoFamiliar', grupoFamiliarSchema);

export default GrupoFamiliar;