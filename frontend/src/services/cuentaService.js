const API_URL = 'https://cuentiapp.onrender.com/api/cuentas';

export const getCuentas = async (token) => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};