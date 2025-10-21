// src/components/SalaCard.tsx

import React from 'react';

// --- Player Data Interface ---
interface PlayerData {
  isAvailable: boolean; // true: Slot libre | false: Slot ocupado
  userName: string; // Nombre del usuario (vacío si isAvailable es true)
}

// --- PlayerButton Component and Props ---
interface PlayerButtonProps {
  number: number; // 1..10
  data: PlayerData;
  isSelected: boolean; // true si es el slot del usuario actual (solo en su sala)
}

const PlayerButton: React.FC<PlayerButtonProps> = ({
  number,
  data,
  isSelected,
}) => {
  const { isAvailable, userName } = data;

  // Contenedor del slot
  const slotClasses =
    'flex flex-col items-center justify-start w-1/5 min-w-[70px] p-1';

  // Círculo del jugador
  const circleBaseClasses =
    'w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs shadow-inner transition duration-150 border';

  // Color según estado:
  // 1) seleccionado (usuario actual en su sala) -> azul
  // 2) libre -> verde
  // 3) ocupado -> rojo
  const circleColorClasses = isSelected
    ? 'bg-blue-600/90 text-white border-blue-300/40 shadow-lg shadow-blue-900/40'
    : isAvailable
      ? 'bg-green-600/90 text-white border-green-300/30 shadow-lg shadow-green-900/30'
      : 'bg-red-600/90 text-white border-red-300/30 shadow-lg shadow-red-900/40';

  return (
    <div className={slotClasses}>
      {/* Círculo del Jugador */}
      <div
        className={`${circleBaseClasses} ${circleColorClasses}`}
        title={`Slot ${number} - ${isAvailable ? 'Libre' : userName}`}
      >
        {number}
      </div>

      {/* Nombre del Usuario */}
      <p
        className={`mt-1 text-center text-xs font-medium truncate w-full ${
          isAvailable ? 'text-green-300/80' : 'text-white'
        }`}
      >
        {isAvailable ? 'LIBRE' : userName}
      </p>
    </div>
  );
};

// --- SalaCard Component and Props ---
interface SalaCardProps {
  id: number;
  title: string;
  players: PlayerData[]; // Array de 10 objetos
  connectInfo: string | null;
  actionText: string;
  onActionClick: () => void;
  isUserInRoom: boolean; // si el usuario actual está en esta sala
  currentUserSlot?: number | null; // 1..10 (posición del usuario en esta sala)
}

const SalaCard: React.FC<SalaCardProps> = ({
  id,
  title,
  players,
  connectInfo,
  actionText,
  onActionClick,
  isUserInRoom,
  currentUserSlot = null,
}) => {
  // Estado de la sala
  const isRoomFull = players.every((p) => !p.isAvailable);

  // Borde de la tarjeta:
  // Azul (usuario dentro) > Rojo (llena) > Verde (disponible)
  let cardBorderClasses =
    'border-2 rounded-lg p-4 my-4 shadow-2xl bg-gray-800/80';
  if (isUserInRoom) {
    cardBorderClasses += ' border-blue-500 shadow-blue-700/30';
  } else if (isRoomFull) {
    cardBorderClasses += ' border-red-500 shadow-red-700/30';
  } else {
    cardBorderClasses += ' border-green-500 shadow-green-700/30';
  }

  // Divide jugadores en 2 grupos de 5
  const group1 = players.slice(0, 5);
  const group2 = players.slice(5, 10);

  const renderPlayerGroup = (group: PlayerData[], startOffset: number) => (
    <div className="flex justify-start space-x-2">
      {group.map((player, index) => {
        const slotNumber = index + 1 + startOffset; // 1..10
        const isSelected =
          Boolean(isUserInRoom) &&
          currentUserSlot != null &&
          slotNumber === currentUserSlot;
        return (
          <PlayerButton
            key={slotNumber}
            number={slotNumber}
            data={player}
            isSelected={isSelected}
          />
        );
      })}
    </div>
  );

  // Texto del botón
  let buttonText = actionText;
  if (isUserInRoom) {
    buttonText = 'DESCONECTARSE';
  } else if (isRoomFull) {
    buttonText = 'SALA LLENA';
  }

  // Visibilidad del botón
  const isButtonVisible = !isRoomFull || isUserInRoom;

  return (
    <div className={cardBorderClasses}>
      <h3 className="text-xl font-bold mb-3 text-white">
        <span className="text-gray-400">#ID {id} - </span>
        {title}
      </h3>

      {/* Player buttons */}
      <div className="flex justify-between items-start gap-4 mb-4 border-b border-gray-700 pb-4">
        {/* Grupo 1 (1-5) */}
        {renderPlayerGroup(group1, 0)}

        {/* Separador */}
        <div className="h-full w-px bg-gray-700 hidden sm:block"></div>

        {/* Grupo 2 (6-10) */}
        {renderPlayerGroup(group2, 5)}
      </div>

      {/* Connection / Action */}
      <div className="flex justify-between items-center mt-2">
        {/* Mostrar IP solo si el usuario está en esta sala */}
        {isUserInRoom && connectInfo ? (
          <p className="text-sm text-blue-300 font-mono bg-gray-700/50 p-1 rounded">
            SV: {connectInfo}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            {isRoomFull && !isUserInRoom ? 'Sala Completa' : ''}
          </p>
        )}

        {isButtonVisible && (
          <button
            onClick={onActionClick}
            disabled={isRoomFull && !isUserInRoom}
            className={`px-6 py-2 font-bold rounded shadow-lg transition duration-200 ease-in-out text-sm
              ${
                isUserInRoom
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : isRoomFull
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default SalaCard;
