import { useEffect, useState } from 'react';
import Layout from '../components/MainLayout';
const API_URL = import.meta.env.VITE_API_URL;

const iconosSugeridos = {
  Alimentos: {
    color: '#FF7F50',
    emojis: ['🍔', '🍕', '🍣', '🍎', '🍩', '🍷'],
  },
  Transporte: {
    color: '#1E90FF',
    emojis: ['🚗', '✈️', '🚕', '🚌'],
  },
  Compras: {
    color: '#9370DB',
    emojis: ['🛒', '🛍️', '👕', '👟', '🎁'],
  },
  Tecnología: {
    color: '#20B2AA',
    emojis: ['📱', '💻', '📷', '📺'],
  },
  Hogar: {
    color: '#FFA500',
    emojis: ['🏠', '🛏️', '🚿', '🛠️'],
  },
  Salud: {
    color: '#DC143C',
    emojis: ['🏥', '💊', '🩺'],
  },
  Entretenimiento: {
    color: '#32CD32',
    emojis: ['🎮', '🎬', '🎵', '🧸'],
  },
  Finanzas: {
    color: '#2E8B57',
    emojis: ['💳', '💰', '📈'],
  },
};


const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('');
  const [color, setColor] = useState('#000000');
  const [editandoId, setEditandoId] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const token = localStorage.getItem('token');

  const obtenerCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensajeError('');
    const body = JSON.stringify({ nombre, icono, color });
    const opciones = {
      method: editandoId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body
    };

    const endpoint = editandoId
      ? `${API_URL}/categorias/${editandoId}`
      : `${API_URL}/categorias`;

    const res = await fetch(endpoint, opciones);
    const data = await res.json();

    if (!res.ok) {
      setMensajeError(data.mensaje || 'Error al guardar categoría');
      return;
    }
    setNombre('');
    setIcono('');
    setColor('#000000');
    setEditandoId(null);
    obtenerCategorias();
  };

  const handleEditar = (cat) => {
    setEditandoId(cat._id);
    setNombre(cat.nombre);
    setIcono(cat.icono);
    setColor(cat.color || '#000000');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta categoría?')) return;
    const res = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      obtenerCategorias();
    } else {
      alert('Error al eliminar categoría');
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">Tus Categorías</h1>
        <form onSubmit={handleGuardar} className="mb-6 bg-white shadow rounded p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-2">{editandoId ? 'Editar categoría' : 'Nueva categoría'}</h2>
          {mensajeError && <p className="text-red-600 text-sm mb-2">{mensajeError}</p>}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              required
            />
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setMostrarPicker(!mostrarPicker)}
                className="border rounded px-2 py-2 w-full bg-white flex justify-center items-center"
              >
                {icono ? (
                  <span className="text-2xl">{icono}</span>
                ) : (
                  <span className="text-gray-700">Seleccionar ícono</span>
                )}
              </button>
              {mostrarPicker && (
                <div className="absolute z-50 mt-2 bg-white border rounded shadow p-3 max-h-80 overflow-y-auto space-y-4 w-full">
                  {Object.entries(iconosSugeridos).map(([categoria, { emojis, color }]) => (
                    <div key={categoria}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">{categoria}</p>
                      <div className="grid grid-cols-6 gap-2">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="text-2xl flex justify-center items-center hover:scale-110 transition"
                            onClick={() => {
                              setIcono(emoji);
                              setColor(color);
                              setMostrarPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {editandoId ? 'Guardar cambios' : 'Agregar categoría'}
          </button>
        </form>
        <div className="space-y-4">
          {categorias.map((cat) => (
            <div
              key={cat._id}
              className="p-4 bg-gray-100 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <span className="text-xl" style={{ color: cat.color }}>{cat.icono || '📁'}</span>
                  {cat.nombre}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(cat)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(cat._id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Categorias;
