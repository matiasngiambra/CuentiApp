import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al registrar');

      setMensaje('✅ Cuenta creada con éxito. Ya podés iniciar sesión.');
      setNombre('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setMensaje('❌ ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-green-700 text-center">Crear Cuenta</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border p-3 rounded focus:outline-blue-500"
          />
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
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Registrarse
          </button>
        </form>
        {mensaje && (
          <p
            className={`mt-4 p-2 rounded text-sm font-medium ${mensaje.startsWith('✅')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}
          >
            {mensaje}
          </p>
        )}
        <p className="text-sm text-center mt-4">
          ¿Ya tenés una cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline font-medium"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
