import Navbar from '../components/Navbar';

export default function HomePage() {
  const raw = localStorage.getItem('auth');
  const data = raw ? JSON.parse(raw) : null;

  return (
    <>
      <Navbar /> {/* Incluimos el Navbar acá */}
      <section className="grid gap-6 mt-5">
        <div className="rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-teal-400">Home</h1>
          <p className="mt-2 text-gray-300">
            Respuesta del login (lo que devolvió tu backend):
          </p>

          {!data ? (
            <p className="mt-4 text-sm text-red-400">
              No hay datos en <code>localStorage.auth</code>. Iniciá sesión
              primero.
            </p>
          ) : (
            <pre className="mt-4 overflow-auto rounded-lg bg-gray-800 p-4 text-sm leading-relaxed">
              {JSON.stringify(data.user, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </>
  );
}
