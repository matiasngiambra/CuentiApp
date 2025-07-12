import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../components/MainLayout';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const HomePage = () => {
    const [cuentas, setCuentas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [descripcion, setDescripcion] = useState('');
    const [cuentaId, setCuentaId] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [totalesCategoria, setTotalesCategoria] = useState([]);
    const token = localStorage.getItem('token');

    const formatearNumero = (numero) => {
        return new Intl.NumberFormat('es-AR').format(numero);
    };

    const fetchCuentas = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/cuentas', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (res.ok && Array.isArray(data)) {
                setCuentas(data);
            } else {
                console.error('Respuesta inesperada:', data);
                setCuentas([]); 
            }
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
            setCuentas([]);
        }
    };

    const fetchCategorias = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/categorias', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const fetchTotalesCategoria = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/gastos/totales-por-categoria', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTotalesCategoria(data);
        } catch (error) {
            console.error('Error al cargar totales por categoría:', error);
        }
    };

    useEffect(() => {
        fetchTotalesCategoria();
        fetchCuentas();
        fetchCategorias();
    }, []);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setMensajeError('');
        setMensajeExito('');

        if (!monto || !descripcion || !fecha || !cuentaId || !categoriaId) {
            setMensajeError('Todos los campos son obligatorios');
            return;
        }

        const cuenta = cuentas.find((c) => c._id === cuentaId);
        if (!cuenta) {
            setMensajeError('Cuenta no encontrada');
            return;
        }

        if (parseFloat(monto) > cuenta.saldo) {
            setMensajeError('El monto supera el saldo disponible de la cuenta');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/gastos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    monto: parseFloat(monto.replace(/\./g, '')),
                    descripcion,
                    fecha,
                    cuentaId,
                    categoriaId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.mensaje || 'Error al guardar gasto');
            }

            setMensajeExito('Gasto guardado con éxito');
            fetchCuentas();
            fetchCategorias();
            await fetchTotalesCategoria();

            setMonto('');
            setDescripcion('');
            setFecha(new Date().toISOString().slice(0, 10));
            setCuentaId('');
            setCategoriaId('');

            // Cerrar modal automáticamente luego de 1 segundo
            setTimeout(() => {
                setModalAbierto(false);
                setMensajeExito('');
            }, 1000);

        } catch (error) {
            setMensajeError(error.message);
        }
    };

    const obtenerEtiquetaCuenta = (tipo) => {
        switch (tipo) {
            case 'efectivo':
                return '💵 Dinero en Efectivo';
            case 'cuenta':
                return '🏦 Dinero en Cuenta';
            case 'virtual':
                return '💳 Billetera Virtual';
            default:
                return 'Cuenta';
        }
    };

    const handleMontoChange = (e) => {
        const valor = e.target.value;
        const limpio = valor.replace(/\D/g, '');
        const formateado = new Intl.NumberFormat('es-AR').format(limpio);
        setMonto(formateado);
    };

    return (
        <Layout>
            <div className="p-6 bg-gray-100">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">¡Bienvenido!</h1>
                <section className="mb-10">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-center md:text-left">Cuentas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cuentas.map((cuenta) => (
                            <div key={cuenta._id} className="bg-white rounded shadow p-4">
                                <h3 className="text-lg font-bold">{cuenta.nombre}</h3>
                                <p className="text-gray-600">{obtenerEtiquetaCuenta(cuenta.tipoCuenta)}</p>
                                <p className={`text-lg font-bold ${cuenta.saldo < 0 ? 'text-red-600' : 'text-green-700'}`}>
                                    ${formatearNumero(cuenta.saldo)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-center md:text-left">Categorías</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                        {categorias.map((cat) => {
                            const total = totalesCategoria.find((t) => t._id === cat._id)?.total || 0;
                            return (
                                <Link
                                    key={cat._id}
                                    to={`/categorias/${cat._id}`}
                                    className="block bg-white p-4 rounded shadow hover:shadow-md transition"
                                >
                                    <p className="text-lg font-bold flex gap-2 items-center">
                                        <span style={{ color: cat.color }}>{cat.icono}</span> {cat.nombre}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Gastado: <strong className="text-blue-700">${formatearNumero(total)}</strong>
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
                {/* Botón flotante para abrir modal */}
                <button
                    onClick={() => setModalAbierto(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-6 py-3 shadow-lg hover:bg-blue-700"
                >
                    + Gasto
                </button>
                {/* Modal para agregar gasto */}
                <Transition show={modalAbierto} as={Fragment}>
                    <Dialog as="div" className="relative z-10" onClose={() => setModalAbierto(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/40" />
                        </Transition.Child>
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                                        <Dialog.Title className="text-lg font-bold mb-4">Nuevo Gasto</Dialog.Title>

                                        {mensajeError && <p className="text-red-600 text-sm mb-2">{mensajeError}</p>}
                                        {mensajeExito && <p className="text-green-600 text-sm mb-2">{mensajeExito}</p>}

                                        <form onSubmit={handleGuardar}>
                                            <input
                                                type="text"
                                                placeholder="Descripción"
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                className="w-full mb-3 p-2 border rounded"
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="Monto"
                                                value={monto}
                                                onChange={handleMontoChange}
                                                className="w-full mb-3 p-2 border rounded"
                                                required
                                            />
                                            <input
                                                type="date"
                                                value={fecha}
                                                onChange={(e) => setFecha(e.target.value)}
                                                className="w-full mb-3 p-2 border rounded"
                                                required
                                            />

                                            <select
                                                value={cuentaId}
                                                onChange={(e) => setCuentaId(e.target.value)}
                                                className="w-full mb-3 p-2 border rounded"
                                                required
                                            >
                                                <option value="">Seleccionar cuenta</option>
                                                {cuentas.map((cuenta) => (
                                                    <option key={cuenta._id} value={cuenta._id}>
                                                        {cuenta.nombre}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={categoriaId}
                                                onChange={(e) => setCategoriaId(e.target.value)}
                                                className="w-full mb-3 p-2 border rounded"
                                                required
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categorias.map((categoria) => (
                                                    <option key={categoria._id} value={categoria._id}>
                                                        {categoria.nombre}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                type="submit"
                                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                            >
                                                Guardar gasto
                                            </button>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </Layout>
    );
};

export default HomePage;
