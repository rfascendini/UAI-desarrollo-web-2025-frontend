import type { Player, Room } from '../types';
import { RoomCard } from './RoomCard';

type RoomsSectionProps = {
  profileExists: boolean;
  rooms: Room[];
  onJoin: (room: Room) => void;
  onLeave: (room: Room) => void;
  onEdit: (room: Room) => void;
  onMove: (room: Room, player: Player) => void;
  onKick: (room: Room, player: Player) => void;
  onTransfer: (room: Room, player: Player) => void;
  onCopy: (command: string) => void;
};

export function RoomsList({
  profileExists,
  rooms,
  onJoin,
  onLeave,
  onEdit,
  onMove,
  onKick,
  onTransfer,
  onCopy,
}: RoomsSectionProps) {
  return (
    <section className="min-h-0 flex-1 overflow-y-auto pr-2">
      {!profileExists && (
        <div className="rounded border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-300">
          Inicia sesion para ver y crear salas.
        </div>
      )}
      {profileExists && rooms.length === 0 && (
        <div className="rounded border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center text-zinc-300">
          Todavia no hay salas activas.
        </div>
      )}
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onJoin={() => onJoin(room)}
          onLeave={() => onLeave(room)}
          onEdit={() => onEdit(room)}
          onMove={(player) => onMove(room, player)}
          onKick={(player) => onKick(room, player)}
          onTransfer={(player) => onTransfer(room, player)}
          onCopy={onCopy}
        />
      ))}
    </section>
  );
}
