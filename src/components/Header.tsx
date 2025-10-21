import React from 'react';

interface HeaderProps {
  appName?: string;
  userName?: string | null; // null o vacío si no hay sesión
  onProfileClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  appName = 'NOMBRE APP',
  userName = null,
  onProfileClick = () => console.log('Perfil clickeado'),
  onLoginClick = () => console.log('Iniciar sesión clickeado'),
  onLogoutClick = () => console.log('Logout clickeado'),
}) => {
  const isLoggedIn = !!userName && userName.trim() !== '';

  return (
    <header className="bg-black/90 p-4 flex justify-between items-center shadow-lg border-b border-yellow-500">
      {/* Nombre de la App */}
      <div
        className="text-4xl font-bold text-white tracking-wider"
        style={{
          textShadow: '0 0 10px #ff9900, 0 0 20px #ff6600',
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid #ff9900',
        }}
      >
        {appName}
      </div>

      {/* Lado derecho (login o info de usuario) */}
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          // ---- No logueado ----
          <button
            onClick={onLoginClick}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded shadow-md transition duration-200 text-sm"
          >
            INICIAR SESIÓN
          </button>
        ) : (
          // ---- Logueado ----
          <>
            <span className="text-white text-lg font-semibold hidden md:inline">
              {userName}
            </span>
            <div className="flex flex-col space-y-2">
              <button
                onClick={onProfileClick}
                className="px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white font-semibold rounded shadow-md transition duration-200 text-sm"
              >
                MI PERFIL
              </button>
              <button
                onClick={onLogoutClick}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded shadow-md transition duration-200 text-sm"
              >
                LOGOUT
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
