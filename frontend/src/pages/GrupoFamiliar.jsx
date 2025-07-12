import { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
const API_URL = import.meta.env.VITE_API_URL;

function GrupoFamiliar() {
  const [miembros, setMiembros] = useState([]);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [emailInvitar, setEmailInvitar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [tieneGrupo, setTieneGrupo] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    const u = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    setUsuario(u);

    if (u?.grupoFamiliarId) {
      setTieneGrupo(true);
    } else {
      setTieneGrupo(false);
    }
  }, []);

  useEffect(() => {
    if (usuario && tieneGrupo) {
      fetchMiembros();
    }
  }, [usuario, tieneGrupo]);

  const fetchMiembros = () => {
    fetch(`${API_URL}/grupo/miembros`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setMensaje('❌ No se pudieron obtener los miembros.');
          return;
        }

        setMiembros(data);
        setNombreGrupo(data[0]?.grupoFamiliarId?.nombre || '');

        const actual = data.find((m) => String(m._id) === String(usuario?.id));
        console.log('Admin detectado:', actual?.nombre, actual?.esAdminGrupo); // ← DEBUG
        setEsAdmin(actual?.esAdminGrupo || false);

      })
      .catch(() => {
        setMensaje('❌ Error al obtener miembros del grupo.');
      });
  };

  const handleCrearGrupo = async () => {
    const nombre = prompt('Nombre del grupo:');
    if (!nombre) return;

    try {
      const res = await fetch(`${API_URL}/grupo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || 'Error');

      alert('✅ Grupo creado');

      // Obtener perfil actualizado del usuario
      const resPerfil = await fetch(`${API_URL}/auth/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const perfil = await resPerfil.json();

      // Actualizar localStorage
      localStorage.setItem('usuario', JSON.stringify({
        id: perfil._id,
        nombre: perfil.nombre,
        email: perfil.email,
        grupoFamiliarId: data.grupoFamiliarId,
        esAdminGrupo: true
      }));

      // Refrescar estados locales
      setTieneGrupo(true);
      setEsAdmin(true);
      setUsuario({
        id: perfil._id,
        nombre: perfil.nombre,
        email: perfil.email,
        grupoFamiliarId: data.grupoFamiliarId,
        esAdminGrupo: true
      });

      fetchMiembros();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };


  const handleInvitar = async () => {
    if (!emailInvitar) return;
    try {
      const res = await fetch(`${API_URL}/grupo/invitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailInvitar }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert('❌ ' + (data.mensaje || 'Error al invitar'));
        return;
      }
      alert('✅ Usuario invitado');
      setEmailInvitar('');
      window.location.reload();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleEliminarMiembro = async (id) => {
    if (!window.confirm('¿Eliminar este miembro del grupo?')) return;
    try {
      const res = await fetch(`${API_URL}/grupo/miembros/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error');
      alert('✅ Miembro eliminado');
      window.location.reload();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleEliminarGrupo = async () => {
    if (!window.confirm('¿Eliminar el grupo completo?')) return;
    try {
      const res = await fetch(`${API_URL}/grupo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error');
      alert('✅ Grupo eliminado');
      localStorage.setItem('usuario', JSON.stringify({ ...usuario, grupoFamiliarId: null, esAdminGrupo: false }));
      window.location.reload();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto p-6 mt-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Grupo Familiar</h1>
        {!tieneGrupo ? (
          <div className="text-center">
            <p className="mb-4">Aún no pertenecés a un grupo familiar.</p>
            <button
              onClick={handleCrearGrupo}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Crear grupo
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-center">
              <strong>Nombre del grupo:</strong> {nombreGrupo}
            </p>

            <h2 className="text-lg font-semibold mb-2">Miembros</h2>
            <ul className="mb-4">
              {miembros.map((m) => (
                <li
                  key={m._id}
                  className="flex justify-between items-center border-b py-2 text-gray-800"
                >
                  <span className="flex items-center gap-2">
                    {m.nombre}
                    {m.esAdminGrupo && <span title="Administrador">👑</span>}
                  </span>

                  {esAdmin && m._id !== usuario.id && (
                    <button
                      onClick={() => handleEliminarMiembro(m._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {esAdmin && (
              <div className="mt-6">
                {miembros.length >= 2 ? (
                  <p className="text-sm text-red-600 mb-4">
                    ⚠️ Ya hay 2 miembros en el grupo. No podés agregar más.
                  </p>
                ) : (
                  <>
                    <h3 className="font-semibold mb-2">Invitar a un usuario</h3>
                    <input
                      type="email"
                      placeholder="Email del usuario"
                      className="w-full p-2 border rounded mb-2"
                      value={emailInvitar}
                      onChange={(e) => setEmailInvitar(e.target.value)}
                    />
                    <button
                      onClick={handleInvitar}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
                    >
                      Invitar
                    </button>
                  </>
                )}
                <hr className="my-4" />
                <button
                  onClick={handleEliminarGrupo}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Eliminar grupo familiar
                </button>
              </div>
            )}

          </>
        )}
      </div>
    </MainLayout>
  );
}

export default GrupoFamiliar;
