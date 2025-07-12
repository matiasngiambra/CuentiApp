import { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
const API_URL = import.meta.env.VITE_API_URL;


function PerfilPage() {
  const [usuario, setUsuario] = useState({ nombre: '', email: '' });
  const [grupo, setGrupo] = useState(null);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/usuarios/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsuario(data);

        if (data?.grupoFamiliarId) {
          fetch(`${API_URL}/grupo/miembros`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(grupoData => setGrupo(grupoData.length > 0 ? grupoData[0].grupoFamiliarId : null));
        }
      });
  }, []);


  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (nueva !== confirmacion) {
      setMensaje('❌ Las contraseñas no coinciden.');
      return;
    }

    const res = await fetch(`${API_URL}/usuarios/cambiar-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ actual, nueva })
    });

    const data = await res.json();
    if (!res.ok) {
      setMensaje('❌ ' + (data.mensaje || 'Error al cambiar contraseña.'));
    } else {
      setMensaje('✅ Contraseña cambiada con éxito.');
      setActual('');
      setNueva('');
      setConfirmacion('');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto p-6 mt-6 bg-white rounded shadow">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-center md:text-left">Perfil de Usuario</h1>

        <div className="mb-6">
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
        </div>

        <form onSubmit={handleCambiarPassword} className="space-y-4">
          <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
          {mensaje && <p className="text-sm mb-2">{mensaje}</p>}
          <input
            type="password"
            placeholder="Contraseña actual"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Guardar cambios
          </button>
        </form>

        {grupo && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Grupo Familiar</h2>
            <p><strong>Nombre del grupo:</strong> {grupo.nombre}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default PerfilPage;
