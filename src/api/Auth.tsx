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
  console.log('VITE_API_KEY:', 'http://localhost:3000/api');

  const baseUrl = 'http://localhost:3000/api';
  if (!baseUrl) throw new Error('VITE_API_KEY no está configurada');

  const apiUrl = `${baseUrl.replace(/\/$/, '')}/users/login`;
  console.log('Usando API URL:', apiUrl);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    console.log(data);

    if (!data.user) {
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
