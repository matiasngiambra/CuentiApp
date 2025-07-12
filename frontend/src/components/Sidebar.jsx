import { NavLink } from 'react-router-dom';
import { FaHome, FaWallet, FaChartPie, FaUser, FaUsers, FaChartBar } from 'react-icons/fa';
import logoCuenti from '/src/assets/CuentiApp.png';

const links = [
  { to: '/', label: 'Inicio', icon: <FaHome /> },
  { to: '/cuentas', label: 'Cuentas', icon: <FaWallet /> },
  { to: '/categorias', label: 'Categorías', icon: <FaChartPie /> },
  { to: '/estadisticas', label: 'Estadísticas', icon: <FaChartBar /> },
  { to: '/grupo', label: 'Grupo Familiar', icon: <FaUsers /> },
  { to: '/perfil', label: 'Perfil', icon: <FaUser /> },
];

const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`bg-white h-screen p-4 shadow-md transition-all duration-300 overflow-y-auto ${
        isOpen ? 'w-56' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-center mb-6 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <img src={logoCuenti} alt="Logo CuentiApp" className="h-10 w-auto" />
      </div>

      {/* Menú de navegación */}
      <nav className="flex flex-col gap-2 sm:gap-3">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            title={!isOpen ? label : ''}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-sm transition-all ${
                isActive ? 'bg-gray-200 font-semibold' : ''
              } ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <span className="text-lg">{icon}</span>
            {isOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
