import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    // Borrar auth y redirigir
    localStorage.removeItem('auth');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-gray-900/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          to="/home"
          className="text-xl font-bold tracking-tight text-teal-400"
        >
          ReservApp
        </Link>

        <nav className="flex items-center gap-4">
          {/* Botón Logout si ya hay sesión */}
          {localStorage.getItem('auth') && (
            <button
              onClick={handleLogout}
              className="rounded bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
