const API_URL = 'http://localhost:5000/api/auth';

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })

  });

  const data = await res.json();
  console.log('Respuesta del login:', data);

  if (!res.ok) throw new Error(data.mensaje || 'Error al iniciar sesión');

  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));

  return data;
};