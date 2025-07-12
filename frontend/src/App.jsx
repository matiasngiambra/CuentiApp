import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CategoriaDetalle from './pages/CategoriaDetalle';
import Categorias from './pages/Categorias';
import Estadisticas from './pages/Estadisticas';
import GrupoFamiliar from './pages/GrupoFamiliar';
import Cuentas from './pages/Cuentas';
import RegisterPage from './pages/RegisterPage';
import PerfilPage from './pages/PerfilPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const syncToken = () => {
      const updatedToken = localStorage.getItem('token');
      setToken(updatedToken);
    };
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/" element={token ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/:id" element={token ? <CategoriaDetalle /> : <Navigate to="/login" />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/cuentas" element={<Cuentas />} />
        <Route path="/grupo" element={token ? <GrupoFamiliar /> : <Navigate to="/login" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="*" element={<p className="p-4 text-center">Página no encontrada</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
