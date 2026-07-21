import { RoomsList } from '../components/RoomsList';
import type { Player, Room, UserProfile } from '../types';

type RoomsPageProps = {
  profile: UserProfile | null;
  rooms: Room[];
  canCreate: boolean;
  error: string;
  notice: string;
  onCreate: () => void;
  onJoin: (room: Room) => void;
  onLeave: (room: Room) => void;
  onEdit: (room: Room) => void;
  onMove: (room: Room, player: Player) => void;
  onKick: (room: Room, player: Player) => void;
  onTransfer: (room: Room, player: Player) => void;
  onCopy: (command: string) => void;
};

export function RoomsPage({
  profile,
  rooms,
  canCreate,
  error,
  notice,
  onCreate,
  onJoin,
  onLeave,
  onEdit,
  onMove,
  onKick,
  onTransfer,
  onCopy,
}: RoomsPageProps) {
  return (
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">Salas disponibles</h1>
          <p className="text-sm text-zinc-400">Equipos 5 vs 5, máximo 10 jugadores por sala.</p>
        </div>
        {profile && (
          <button className="btn-primary" disabled={!canCreate} onClick={onCreate}>
            Crear sala
          </button>
        )}
      </div>

      {error && <div className="mb-3 rounded border border-red-500 bg-red-950/60 px-3 py-2 text-sm">{error}</div>}
      {notice && <div className="mb-3 rounded border border-emerald-500 bg-emerald-950/60 px-3 py-2 text-sm">{notice}</div>}

      <RoomsList
        profileExists={Boolean(profile)}
        rooms={rooms}
        onJoin={onJoin}
        onLeave={onLeave}
        onEdit={onEdit}
        onMove={onMove}
        onKick={onKick}
        onTransfer={onTransfer}
        onCopy={onCopy}
      />
    </main>
  );
}
