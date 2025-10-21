import React, { useState } from 'react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    serverIP: string;
    serverPort: number;
    maxPlayers: number; // siempre 10
  }) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serverIP, setServerIP] = useState('');
  const [serverPort, setServerPort] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!serverIP.trim()) return;
    const portNum =
      typeof serverPort === 'string' ? parseInt(serverPort, 10) : serverPort;
    if (!portNum || portNum < 1 || portNum > 65535) return;

    onCreate({
      name: name.trim(),
      description: description.trim(),
      serverIP: serverIP.trim(),
      serverPort: portNum,
      maxPlayers: 10, // fijo
    });

    // reset + cerrar
    setName('');
    setDescription('');
    setServerIP('');
    setServerPort('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full border-t-4 border-yellow-500 relative">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2">
          Crear Nueva Sala
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nombre de la Sala *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Descripción (Opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Server IP *
              </label>
              <input
                type="text"
                placeholder="192.168.0.10"
                value={serverIP}
                onChange={(e) => setServerIP(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Server Port *
              </label>
              <input
                type="number"
                placeholder="27015"
                min={1}
                max={65535}
                value={serverPort}
                onChange={(e) =>
                  setServerPort(
                    e.target.value === '' ? '' : parseInt(e.target.value, 10)
                  )
                }
                className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-2"
                required
              />
            </div>
          </div>

          {/* Info: Máximo fijo */}
          <p className="text-xs text-gray-400">
            Máximo de jugadores: 10 (fijo)
          </p>

          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded text-gray-300 bg-gray-600 hover:bg-gray-500 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded text-black bg-yellow-500 hover:bg-yellow-400 transition"
            >
              Crear Sala
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

export default CreateRoomModal;
