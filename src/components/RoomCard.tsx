import { initials } from '../helpers';
import type { Player, Room } from '../types';

type RoomCardProps = {
  room: Room;
  onJoin: () => void;
  onLeave: () => void;
  onEdit: () => void;
  onMove: (player: Player) => void;
  onKick: (player: Player) => void;
  onTransfer: (player: Player) => void;
  onCopy: (command: string) => void;
};

export function RoomCard({
  room,
  onJoin,
  onLeave,
  onEdit,
  onMove,
  onKick,
  onTransfer,
  onCopy,
}: RoomCardProps) {
  const slots = Array.from({ length: 10 }, (_, index) => {
    const position = index + 1;
    return room.users.find((player) => player.position === position) || null;
  });
  const full = room.playerCount >= 10;
  const border = room.isMember ? 'border-emerald-500 shadow-emerald-900/30' : 'border-blue-500/70 shadow-blue-950/30';

  return (
    <article className={`mb-4 rounded-md border-2 ${border} bg-zinc-950 p-4 shadow-xl`}>
      <RoomSummary room={room} full={full} />
      <RoomTeams slots={slots} />
      <RoomConnection room={room} onCopy={onCopy} />
      <RoomActions
        room={room}
        full={full}
        onJoin={onJoin}
        onLeave={onLeave}
        onEdit={onEdit}
        onMove={onMove}
        onKick={onKick}
        onTransfer={onTransfer}
      />
    </article>
  );
}

function RoomSummary({ room, full }: { room: Room; full: boolean }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{room.name}</h2>
          {room.isMember && <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold">Tu sala</span>}
          {room.isPrivate && <span className="rounded bg-yellow-600 px-2 py-0.5 text-xs font-bold">Privada</span>}
        </div>
        {room.description && <p className="text-sm text-zinc-400">{room.description}</p>}
        <p className="text-sm text-zinc-300">Anfitrión: {room.createdBy.username}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-yellow-400">{room.playerCount}/10</p>
        <p className="text-xs text-zinc-500">{full ? 'Sala completa' : 'Esperando jugadores'}</p>
      </div>
    </div>
  );
}

function RoomTeams({ slots }: { slots: Array<Player | null> }) {
  return (
    <div className="grid grid-cols-2 gap-4 border-y border-zinc-800 py-3">
      {[0, 5].map((offset) => (
        <div key={offset}>
          <h3 className="mb-2 text-sm font-bold text-zinc-300">Equipo {offset === 0 ? '1' : '2'}</h3>
          <div className="grid grid-cols-5 gap-2">
            {slots.slice(offset, offset + 5).map((player, index) => {
              const position = offset + index + 1;
              return (
                <div key={position} className="h-20 rounded border border-zinc-800 bg-zinc-900 p-2 text-center">
                  {player ? (
                    <>
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-sm font-bold">
                        {initials(player.user.firstName, player.user.lastName)}
                      </div>
                      <p className="mt-1 truncate text-xs font-semibold">{player.user.username}</p>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-zinc-600 text-sm text-zinc-500">
                        {position}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">Libre</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoomConnection({ room, onCopy }: { room: Room; onCopy: (command: string) => void }) {
  if (!room.connection) {
    return room.isMember ? <p className="mt-3 text-sm text-zinc-400">No hay datos de servidor cargados.</p> : null;
  }

  return (
    <div className="mt-3 rounded border border-emerald-700 bg-emerald-950/30 p-3 text-sm">
      <p className="font-mono">IP: {room.connection.serverIP}:{room.connection.serverPort}</p>
      <p className="font-mono">{room.connection.command}</p>
      {room.connection.serverPassword && <p>Contraseña: {room.connection.serverPassword}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => onCopy(`${room.connection!.serverIP}:${room.connection!.serverPort}`)}>
          Copiar IP
        </button>
        <button className="btn-secondary" onClick={() => onCopy(room.connection!.command)}>
          Copiar comando
        </button>
        {room.connection.serverPassword && (
          <button className="btn-secondary" onClick={() => onCopy(room.connection!.serverPassword)}>
            Copiar contraseña
          </button>
        )}
        <a className="btn-primary" href={room.connection.steamUrl}>
          Conectarse al servidor
        </a>
      </div>
    </div>
  );
}

function RoomActions({
  room,
  full,
  onJoin,
  onLeave,
  onEdit,
  onMove,
  onKick,
  onTransfer,
}: Omit<RoomCardProps, 'onCopy'> & { full: boolean }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {room.isMember ? (
        <>
          <button className="btn-secondary" onClick={onLeave}>
            {room.isHost ? 'Cerrar sala' : 'Abandonar'}
          </button>
          {room.isHost && (
            <button className="btn-primary" onClick={onEdit}>
              Editar sala
            </button>
          )}
        </>
      ) : (
        <button className="btn-primary" disabled={full} onClick={onJoin}>
          {full ? 'Sala llena' : 'Unirse'}
        </button>
      )}
      {room.isHost &&
        room.users
          .filter((player) => player.user.id !== room.createdBy.id)
          .map((player) => (
            <span key={player.user.id} className="flex gap-1">
              <button className="mini-btn" onClick={() => onMove(player)}>
                Mover {player.user.username}
              </button>
              <button className="mini-btn" onClick={() => onKick(player)}>
                Expulsar
              </button>
              <button className="mini-btn" onClick={() => onTransfer(player)}>
                Transferir
              </button>
            </span>
          ))}
    </div>
  );
}
