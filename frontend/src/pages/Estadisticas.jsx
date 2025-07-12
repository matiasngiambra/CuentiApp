import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Layout from "../components/MainLayout";
const API_URL = import.meta.env.VITE_API_URL;

const Estadisticas = () => {
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datosPersonales, setDatosPersonales] = useState([]);
  const [datosGrupoFamiliar, setDatosGrupoFamiliar] = useState([]);
  const [usuariosGrupo, setUsuariosGrupo] = useState([]);
  const [totalGrupoFamiliar, setTotalGrupoFamiliar] = useState(0);
  const meses = [...Array(12).keys()].map((i) => new Date(0, i).toLocaleString('es', { month: 'long' }));

  useEffect(() => {
    const obtenerEstadisticasGrupo = async () => {
      try {
        const token = localStorage.getItem('token');
        const desdeISO = new Date(anio, mes, 1).toISOString();
        const hastaISO = new Date(anio, mes + 1, 0, 23, 59, 59, 999).toISOString();

        const res = await fetch(`${API_URL}/gastos/estadisticas/grupo?desde=${desdeISO}&hasta=${hastaISO}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const categoriasUnicas = [...new Set(data.map((item) => item.categoria))];
        const usuariosUnicos = [...new Set(data.map((item) => item.usuario))];
        const datosTransformados = categoriasUnicas.map((cat) => {
          const entrada = { categoria: cat };
          usuariosUnicos.forEach((usuario) => {
            const item = data.find((d) => d.categoria === cat && d.usuario === usuario);
            entrada[usuario] = item ? item.total : 0;
          });
          return entrada;
        });
        setDatosGrupoFamiliar(datosTransformados);
        setUsuariosGrupo(usuariosUnicos);
        setTotalGrupoFamiliar(data.reduce((acc, item) => acc + item.total, 0));
      } catch (error) {
        console.error('Error al obtener estadísticas del grupo:', error);
      }
    };

    const obtenerEstadisticasPersonales = async () => {
      try {
        const token = localStorage.getItem('token');
        const desdeISO = new Date(anio, mes, 1).toISOString();
        const hastaISO = new Date(anio, mes + 1, 0, 23, 59, 59, 999).toISOString();

        const res = await fetch(`${API_URL}/gastos/estadisticas/usuario?desde=${desdeISO}&hasta=${hastaISO}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setDatosPersonales(data);
      } catch (error) {
        console.error('Error al obtener estadísticas personales:', error);
      }
    };

    obtenerEstadisticasGrupo();
    obtenerEstadisticasPersonales();
  }, [mes, anio]);

  const totalPersonal = datosPersonales.reduce((acc, curr) => acc + curr.total, 0);
  const colores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57'];

  return (
    <Layout>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">Estadísticas</h1>

        <div className="flex justify-center gap-4 mb-4">
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {meses.map((mes, i) => (
              <option key={i} value={i}>{mes.charAt(0).toUpperCase() + mes.slice(1)}</option>
            ))}
          </select>
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {[2024, 2025, 2026].map((anio) => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Tus gastos personales</h2>
          <p className="mb-2">Total del mes: <strong>${totalPersonal.toLocaleString()}</strong></p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosPersonales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total">
                {datosPersonales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {datosGrupoFamiliar.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Gastos del grupo familiar</h2>
            <p className="text-sm text-center mb-2">Total combinado: <strong>${totalGrupoFamiliar.toLocaleString()}</strong></p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosGrupoFamiliar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Legend />
                {usuariosGrupo.map((usuario, index) => (
                  <Bar key={usuario} dataKey={usuario} fill={colores[index % colores.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Estadisticas;
