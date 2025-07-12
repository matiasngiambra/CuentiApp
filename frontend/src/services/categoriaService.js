const API_URL = 'http://localhost:5000/api/categorias';

export const getCategorias = async (token) => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
