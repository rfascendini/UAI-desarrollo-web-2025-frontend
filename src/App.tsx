import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import SalaCard from './components/SalaCard';
import CreateRoomModal from './components/CreateRoomModal';
import { login, me, type LoginResponse } from './api/Auth';

// Convierte boolean[] → PlayerData[] (agrega "Vos" si corresponde)
const toPlayers = (arr: boolean[], mySlot?: number | null) =>
  arr.map((isFree, i) => ({
    isAvailable: isFree,
    userName: isFree
      ? ''
      : mySlot && i + 1 === mySlot
        ? 'Vos'
        : `Jugador ${i + 1}`,
  }));

type User = { id: string; email: string; name?: string };

// --- Login Modal embebido (simple) ---
const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (auth: LoginResponse) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth = await login(email.trim(), password);
      onSuccess(auth);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error de autenticación');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-yellow-500 relative">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2">
          Iniciar Sesión
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-2"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded text-gray-300 bg-gray-600 hover:bg-gray-500 transition"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded text-black bg-yellow-500 hover:bg-yellow-400 transition disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
          title="Cerrar"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

function App() {
  // --------- Auth ---------
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token')
  );
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  // Verificar sesión al montar (token o cookie)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await me(token || undefined);
        if (!mounted) return;
        if (profile) {
          setUser(profile.user ?? profile);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleLoginSuccess = async (auth: LoginResponse) => {
    localStorage.setItem('auth_token', auth.token);
    setToken(auth.token);
    const profile = await me(auth.token);
    setUser(profile?.user ?? auth.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setMyRoomId(null);
    setMySlot(null);
  };

  // --------- Rooms (sin seeds) ---------
  const [salas, setSalas] = useState<
    {
      id: number;
      title: string;
      players: boolean[];
      connectInfo: string | null;
      actionText: string;
    }[]
  >([]);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [myRoomId, setMyRoomId] = useState<number | null>(null);
  const [mySlot, setMySlot] = useState<number | null>(null);

  // Crear sala (te mete en slot 1)
  const handleCreateRoom = (data: {
    name: string;
    description: string;
    serverIP: string;
    serverPort: number;
    maxPlayers: number; // 10 fijo
  }) => {
    const nextId = (salas.at(-1)?.id ?? 0) + 1;
    const title = data.description
      ? `${data.name} - ${data.description}`
      : data.name;
    const connectInfo = `${data.serverIP}:${data.serverPort}`;
    const actionText = 'CONECTARSE AL SV';

    const players = Array(10).fill(true);
    players[0] = false; // vos en el slot 1

    const nuevaSala = { id: nextId, title, players, connectInfo, actionText };
    setSalas((prev) => [...prev, nuevaSala]);
    setMyRoomId(nextId);
    setMySlot(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden font-inter">
      {/* Header */}
      <Header
        appName="CS Play"
        userName={user?.name || user?.email || null}
        onProfileClick={() => console.log('Perfil')}
        onLoginClick={() => setLoginOpen(true)}
        onLogoutClick={handleLogout}
      />

      {/* Main */}
      <main className="flex-grow p-4 md:p-8 lg:p-12 z-20">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-yellow-400 border-b border-gray-700 pb-2">
              Salas Disponibles
            </h2>

            {/* Crear sala solo si hay sesión */}
            {user && (
              <button
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 text-sm font-semibold rounded text-black bg-yellow-500 hover:bg-yellow-400 transition"
              >
                Crear sala
              </button>
            )}
          </div>

          {/* Estado de sesión */}
          {checkingSession && (
            <p className="text-gray-400 text-sm mb-4">Verificando sesión...</p>
          )}

          {/* Empty state sin salas */}
          {!checkingSession && salas.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-700 p-6 text-center text-gray-300">
              <p className="mb-2">Todavía no hay salas creadas.</p>
              {!user ? (
                <p className="text-sm text-gray-400">
                  Inicia sesión para crear la primera sala.
                </p>
              ) : (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="mt-3 px-4 py-2 text-sm font-semibold rounded text-black bg-yellow-500 hover:bg-yellow-400 transition"
                >
                  Crear tu primera sala
                </button>
              )}
            </div>
          )}

          {/* Listado de salas */}
          {salas.map((sala) => (
            <SalaCard
              key={sala.id}
              id={sala.id}
              title={sala.title}
              players={toPlayers(
                sala.players,
                myRoomId === sala.id ? mySlot : null
              )}
              connectInfo={sala.connectInfo}
              actionText={sala.actionText}
              onActionClick={() =>
                console.log(`${sala.actionText} en sala ${sala.id}`)
              }
              isUserInRoom={myRoomId === sala.id}
              currentUserSlot={myRoomId === sala.id ? mySlot : null}
            />
          ))}
        </div>
      </main>

      {/* Modales */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {user && (
        <CreateRoomModal
          isOpen={isCreateOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
}

export default App;
