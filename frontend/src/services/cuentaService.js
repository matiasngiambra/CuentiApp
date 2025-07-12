const API_URL = 'http://localhost:5000/api/cuentas';

export const getCuentas = async (token) => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};