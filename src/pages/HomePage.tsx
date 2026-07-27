import { useEffect, useState } from 'react';
import { RoomsList } from '../components/RoomsList';
import { publicApiRequest } from '../api/api';
import type { Room } from '../types';

type HomePageProps = {
  profileExists: boolean;
  onRequireLogin: () => void;
};

const ignoreRoom = () => undefined;
const ignorePlayer = () => undefined;

export function HomePage({ profileExists, onRequireLogin }: HomePageProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const refreshPublicRooms = () => {
      publicApiRequest<{ rooms: Room[] }>('/rooms/public')
        .then((data) => {
          if (!cancelled) {
            setRooms(data.rooms);
            setError('');
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'No se pudieron cargar las salas.');
          }
        });
    };

    refreshPublicRooms();
    const interval = window.setInterval(refreshPublicRooms, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 py-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">Salas publicas</h1>
          <p className="text-sm text-zinc-400">Datos activos traidos desde el backend y MongoDB.</p>
        </div>
        {!profileExists && (
          <button className="btn-primary" onClick={onRequireLogin}>
            Iniciar sesion
          </button>
        )}
      </div>

      {error && <div className="mb-3 rounded border border-red-500 bg-red-950/60 px-3 py-2 text-sm">{error}</div>}

      <RoomsList
        publicView
        profileExists={profileExists}
        rooms={rooms}
        onJoin={ignoreRoom}
        onLeave={ignoreRoom}
        onEdit={ignoreRoom}
        onMove={ignorePlayer}
        onKick={ignorePlayer}
        onTransfer={ignorePlayer}
        onCopy={() => undefined}
        onRequireLogin={onRequireLogin}
      />
    </main>
  );
}
