import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/Auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await login(email, pass);
      // guardamos tal cual para mostrarlo después en Home
      localStorage.setItem('auth', JSON.stringify(data));
      navigate('/home');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr('No se pudo iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 shadow"
      >
        <h1 className="text-2xl font-bold text-teal-400">Iniciar sesión</h1>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Email</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Password</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {err && <p className="text-sm text-red-400">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-teal-500 px-4 py-2 font-medium text-white transition hover:bg-teal-600 disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </section>
  );
}
