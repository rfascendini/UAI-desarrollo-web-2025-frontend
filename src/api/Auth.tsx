export type LoginResponse = {
  token: string; // JWT o session token emitido por el backend
  user: { id: string; email: string; name?: string };
};

// ✅ Función de Login
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  console.log('Iniciando login para:', email);
  console.log('BACKEND_API_URL:', import.meta.env.BACKEND_API_URL);

  const baseUrl = import.meta.env.BACKEND_API_URL;
  if (!baseUrl) throw new Error('BACKEND_API_URL no está configurada');

  const apiUrl = `${baseUrl.replace(/\/$/, '')}/users/login`;
  console.log('Usando API URL:', apiUrl);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let msg = 'Error de autenticación';
      try {
        const errorData = await res.json();
        msg = errorData?.message || msg;
      } catch {
        const text = await res.text().catch(() => '');
        if (text) msg = text;
      }
      throw new Error(msg);
    }

    const data = await res.json();
    if (!data?.token || !data?.user) {
      throw new Error('Respuesta inválida del servidor');
    }

    return data;
  } catch (err: unknown) {
    console.error('Error en login:', err);
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error('Error de red');
  }
}

// ✅ Función para obtener usuario autenticado
export async function me(token?: string) {
  const baseUrl = import.meta.env.BACKEND_API_URL;
  if (!baseUrl) throw new Error('BACKEND_API_URL no está configurada');

  const apiUrl = `${baseUrl.replace(/\/$/, '')}/auth/me`;

  try {
    const res = await fetch(apiUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status !== 401 && res.status !== 403)
        console.warn('Error al obtener /auth/me:', res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    return null;
  }
}
