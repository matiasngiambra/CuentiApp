const API_URL = 'https://cuentiapp.onrender.com/api/categorias';

export const getCategorias = async (token) => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
