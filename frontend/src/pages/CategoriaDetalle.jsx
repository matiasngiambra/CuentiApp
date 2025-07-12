import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
const API_URL = import.meta.env.VITE_API_URL;

const CategoriaDetalle = () => {
    const { id } = useParams();
    const [categoria, setCategoria] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [gastoEnEdicion, setGastoEnEdicion] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(() => {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0'); // los meses arrancan en 0
        const dd = String(hoy.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });
    const [cuentas, setCuentas] = useState([]);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState('');
    const cuentaActual = cuentas.find((c) => c._id === cuentaSeleccionada);
    const token = localStorage.getItem('token');

    const formatearNumero = (numero) => {
        return new Intl.NumberFormat('es-AR').format(numero);
    };

    const obtenerEtiquetaCuenta = (tipoCuenta) => {
        switch (tipoCuenta) {
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

    const cargarCategoria = () => {
        fetch(`${API_URL}/categorias/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setCategoria(data);
                setCargando(false);
            })
            .catch((err) => {
                console.error('Error:', err);
                setCargando(false);
            });
    };

    const cargarCuentas = () => {
        fetch(`${API_URL}/cuentas`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setCuentas(data);
                if (data.length > 0) {
                    setCuentaSeleccionada(data[0]._id); // primer cuenta por defecto
                }
            })
            .catch((err) => console.error('Error al cargar cuentas:', err));
    };

    useEffect(() => {
        cargarCategoria();
        cargarCuentas();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = gastoEnEdicion
                ? `${API_URL}/gastos/${gastoEnEdicion._id}`
                : `${API_URL}/gastos`;

            const metodo = gastoEnEdicion ? 'PUT' : 'POST';
            const montoNumerico = parseFloat(monto.replace(/\./g, ''));

            if (!cuentaActual) {
                alert('Seleccioná una cuenta válida.');
                return;
            }

            if (montoNumerico > cuentaActual.saldo) {
                alert('El monto ingresado excede el saldo disponible de la cuenta.');
                return;
            }
            const body = {
                descripcion,
                monto: montoNumerico,
                fecha,
                categoriaId: id,
                cuentaId: cuentaSeleccionada,
            };
            const res = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Error:', errorData);
                throw new Error(errorData?.mensaje || 'Error al guardar el gasto');
            }

            // Limpiar
            setDescripcion('');
            setMonto('');
            setFecha('');
            setCuentaSeleccionada('');
            setGastoEnEdicion(null); // salir de modo edición
            cargarCategoria();
            cargarCuentas();
        } catch (error) {
            alert('Ocurrió un error al guardar el gasto');
        }
    };

    const handleEliminarGasto = async (gasto) => {
        if (!window.confirm('¿Estás seguro de que querés eliminar este gasto?')) return;
        try {
            const res = await fetch(`${API_URL}/gastos/${gasto._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar gasto');
            alert('Gasto eliminado correctamente');
            cargarCategoria();
            cargarCuentas();
        } catch (err) {
            console.error(err);
            alert('No se pudo eliminar el gasto');
        }
    };

    const handleEditarGasto = (gasto) => {
        setDescripcion(gasto.descripcion);
        setMonto(gasto.monto.toString());
        const fechaISO = gasto.fecha;
        const soloFecha = fechaISO.split('T')[0]; // conserva YYYY-MM-DD sin afectar por zona horaria
        setFecha(soloFecha);
        setCuentaSeleccionada(gasto.cuentaId);
        setGastoEnEdicion(gasto); // activar modo edición
    };

    const handleMontoChange = (e) => {
        const valor = e.target.value;
        // Eliminar todo lo que no sea dígito
        const limpio = valor.replace(/\D/g, '');
        // Agregar separador de miles
        const formateado = new Intl.NumberFormat('es-AR').format(limpio);
        setMonto(formateado);
    };

    if (cargando) return <MainLayout><p className="p-4">Cargando...</p></MainLayout>;
    if (!categoria) return <MainLayout><p className="p-4">Categoría no encontrada</p></MainLayout>;


    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto p-4 sm:p-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2 text-center md:text-left">
                    <span style={{ color: categoria.color }}>{categoria.icono}</span>
                    {categoria.nombre}
                </h1>
                <p className="mb-6 text-lg text-gray-700">
                    Total gastado: <strong className="text-blue-700">${formatearNumero(categoria.total)}</strong>
                </p>
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded shadow space-y-4">
                    <h2 className="text-xl font-semibold">
                        {gastoEnEdicion ? 'Editar Gasto' : 'Agregar Gasto'}
                    </h2>
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Monto"
                        value={monto}
                        onChange={handleMontoChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                    <select
                        value={cuentaSeleccionada}
                        onChange={(e) => setCuentaSeleccionada(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    >
                        <option value="">Seleccioná una cuenta</option>
                        {cuentas.map((cuenta) => (
                            <option key={cuenta._id} value={cuenta._id}>
                                {cuenta.nombre} - {obtenerEtiquetaCuenta(cuenta.tipoCuenta)}
                            </option>
                        ))}
                    </select>
                    {cuentaActual && (
                        <p className="text-sm text-gray-600">
                            Saldo disponible: <span className="font-semibold text-black">${formatearNumero(cuentaActual.saldo)}</span>
                        </p>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {gastoEnEdicion ? 'Guardar cambios' : 'Guardar gasto'}
                    </button>
                </form>
                <h2 className="text-xl font-semibold mb-3">Movimientos</h2>
                {categoria.gastos?.length ? (
                    <ul className="space-y-3">
                        {categoria.gastos.map((gasto) => {
                            const cuenta = gasto.cuentaId;
                            const fechaFormateada = new Date(gasto.fecha).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            });
                            return (
                                <li key={gasto._id} className="bg-white rounded shadow p-3">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <div>
                                            <p className="font-semibold">{gasto.descripcion || 'Sin descripción'}</p>
                                            <p className="text-sm text-gray-500">
                                                {fechaFormateada} ·{' '}
                                                {cuenta && cuenta.nombre && cuenta.tipoCuenta
                                                    ? `${obtenerEtiquetaCuenta(cuenta.tipoCuenta)} - ${cuenta.nombre}`
                                                    : 'Cuenta desconocida'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-blue-700 font-bold">
                                                ${formatearNumero(gasto.monto)}
                                            </span>
                                            {/* Íconos */}
                                            <span
                                                onClick={() => handleEditarGasto(gasto)}
                                                className="cursor-pointer text-gray-600 hover:text-blue-600"
                                                title="Editar"
                                            >
                                                ✏️
                                            </span>
                                            <span
                                                onClick={() => handleEliminarGasto(gasto)}
                                                className="cursor-pointer text-gray-600 hover:text-red-600"
                                                title="Eliminar"
                                            >
                                                ❌
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-600">No hay gastos registrados en esta categoría.</p>
                )}
            </div>
        </MainLayout>
    );
};

export default CategoriaDetalle;
