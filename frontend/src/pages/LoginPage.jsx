import { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import logoCuenti from '/src/assets/CuentiApp.png';
function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 bg-white shadow-lg rounded-lg overflow-hidden p-4 sm:p-6 md:p-10">
        {/* LOGIN */}
        <div className="flex-1">
          <div className="flex justify-center mb-4">
            <img
              src={logoCuenti}
              alt="Logo CuentiApp"
              className="h-36 sm:h-44 md:h-52 w-auto mb-4 transition-transform hover:scale-105"
            />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Iniciar Sesión</h2>

          {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border p-3 rounded focus:outline-blue-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-3 rounded focus:outline-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Ingresar
            </button>
          </form>
          <p className="text-center text-sm mt-4">
            ¿Sos nuevo?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Registrarse
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
