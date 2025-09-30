export type LoginResponse = {
  token: string; // JWT o session token que emite tu backend
  user: { id: string; email: string; name?: string };
};

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const apiUrl = import.meta.env.VITE_API_URL + '/users/login';
  if (!apiUrl) throw new Error('VITE_API_URL no está configurada');
  console.log('Usando API URL:', apiUrl);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // si usás cookies httpOnly
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || 'Error de autenticación');
  }
  return res.json();
}

export async function me(token?: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}
