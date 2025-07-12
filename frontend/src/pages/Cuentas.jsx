import { useEffect, useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
import Layout from '../components/MainLayout';

const obtenerEtiquetaCuenta = (tipo) => {
  switch (tipo) {
    case 'efectivo':
      return '💵 Dinero en efectivo';
    case 'cuenta':
      return '🏦 Dinero en cuenta';
    case 'virtual':
      return '💳 Billetera virtual';
    default:
      return 'Cuenta';
  }
};

const Cuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('efectivo');
  const [saldo, setSaldo] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const token = localStorage.getItem('token');

  const obtenerCuentas = async () => {
    try {
      const res = await fetch(`${API_URL}/cuentas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCuentas(data);
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
    }
  };

  useEffect(() => {
    obtenerCuentas();
  }, []);

  const handleCrearOEditar = async (e) => {
    e.preventDefault();
    setMensajeError('');

    const body = JSON.stringify({
      nombre,
      tipoCuenta,
      saldo: parseFloat(saldo.replace(/\./g, '')),
    });
    const opciones = {
      method: editandoId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    };

    const endpoint = editandoId
      ? `${API_URL}/cuentas/${editandoId}`
      : `${API_URL}/cuentas`;

    const res = await fetch(endpoint, opciones);
    const data = await res.json();

    if (!res.ok) {
      setMensajeError(data.mensaje || 'Error al guardar');
      return;
    }

    setNombre('');
    setTipoCuenta('efectivo');
    setSaldo(0);
    setEditandoId(null);
    obtenerCuentas();
  };

  const handleEditar = (cuenta) => {
    setEditandoId(cuenta._id);
    setNombre(cuenta.nombre);
    setTipoCuenta(cuenta.tipoCuenta);
    setSaldo(new Intl.NumberFormat('es-AR').format(cuenta.saldo));
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta cuenta?')) return;

    const res = await fetch(`${API_URL}/cuentas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      obtenerCuentas();
    } else {
      alert('Error al eliminar la cuenta');
    }
  };

  const sugerirNombrePorTipo = (tipo) => {
    switch (tipo) {
      case 'efectivo':
        return 'Dinero en efectivo';
      case 'cuenta':
        return 'Cuenta bancaria';
      case 'virtual':
        return 'Billetera virtual';
      default:
        return '';
    }
  };

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-AR').format(numero);
  };

  const handleMontoChange = (e) => {
    const valor = e.target.value;
    const limpio = valor.replace(/\D/g, '');
    const formateado = new Intl.NumberFormat('es-AR').format(limpio);
    setSaldo(formateado);
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">Tus Cuentas</h1>

        <form onSubmit={handleCrearOEditar} className="mb-6 bg-white shadow rounded p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-2">{editandoId ? 'Editar cuenta' : 'Nueva cuenta'}</h2>
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
            <select
              value={tipoCuenta}
              onChange={(e) => {
                const nuevoTipo = e.target.value;
                setTipoCuenta(nuevoTipo);
                if (!editandoId) {
                  setNombre(sugerirNombrePorTipo(nuevoTipo));
                }
              }}
              className="border rounded px-2 py-1 w-full"
              required
            >
              <option value="efectivo">Dinero en efectivo</option>
              <option value="cuenta">Dinero en cuenta</option>
              <option value="virtual">Billetera virtual</option>
            </select>
            <input
              type="text"
              placeholder="Monto"
              value={saldo}
              onChange={handleMontoChange}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${cuentas.length >= 3 && !editandoId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
            disabled={cuentas.length >= 3 && !editandoId}
          >
            {editandoId ? 'Guardar cambios' : 'Agregar cuenta'}
          </button>
        </form>

        <div className="space-y-4">
          {cuentas.map((cuenta) => (
            <div key={cuenta._id} className="p-4 bg-gray-100 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <p className="font-semibold">{cuenta.nombre}</p>
                <p className="text-sm text-gray-600">
                  Tipo: {obtenerEtiquetaCuenta(cuenta.tipoCuenta)} | Saldo: ${formatearNumero(cuenta.saldo)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(cuenta)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(cuenta._id)}
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

export default Cuentas;
