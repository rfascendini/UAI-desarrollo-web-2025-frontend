import { apiRequest } from '../../api/api';
import { Field } from '../Field';
import type { ModalFormProps } from './formTypes';

export function RoomForm({ modal, room, form, set, submit, loading, fieldErrors, onMutation }: ModalFormProps) {
  const isEditing = modal === 'edit';
  const isPrivate = form.isPrivate === undefined ? Boolean(room?.isPrivate) : form.isPrivate === 'true';

  return (
    <form
      className="space-y-3"
      onSubmit={submit(() =>
        onMutation((token) =>
          apiRequest(isEditing ? `/rooms/${room?.id}` : '/rooms', token, {
            method: isEditing ? 'PATCH' : 'POST',
            body: JSON.stringify({
              name: form.name || room?.name,
              description: form.description ?? room?.description ?? '',
              isPrivate,
              roomPassword: form.roomPassword || undefined,
              serverIP: form.serverIP || room?.connection?.serverIP || '',
              serverPort: Number(form.serverPort || room?.connection?.serverPort || 27015),
              serverPassword: form.serverPassword || undefined,
            }),
          })
        )
      )}
    >
      <Field
        label="Nombre"
        value={form.name ?? room?.name ?? ''}
        onChange={set('name')}
        error={fieldErrors.name}
        required
      />
      <Field
        label="Descripción"
        value={form.description ?? room?.description ?? ''}
        onChange={set('description')}
        error={fieldErrors.description}
      />
      <Field
        label="IP del servidor"
        value={form.serverIP ?? room?.connection?.serverIP ?? ''}
        onChange={set('serverIP')}
        error={fieldErrors.serverIP}
        required
      />
      <Field
        label="Puerto"
        type="number"
        value={form.serverPort ?? String(room?.connection?.serverPort ?? 27015)}
        onChange={set('serverPort')}
        error={fieldErrors.serverPort}
        required
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPrivate} onChange={(event) => set('isPrivate')(String(event.target.checked))} />
        Sala privada
      </label>
      <Field
        label="Contraseña de sala privada"
        type="password"
        value={form.roomPassword || ''}
        onChange={set('roomPassword')}
        error={fieldErrors.roomPassword}
      />
      <Field
        label="Contraseña del servidor"
        type="password"
        value={form.serverPassword || ''}
        onChange={set('serverPassword')}
        error={fieldErrors.serverPassword}
      />
      <button className="btn-primary w-full" disabled={loading}>
        {isEditing ? 'Guardar' : 'Crear'}
      </button>
    </form>
  );
}

export function JoinRoomForm({ room, form, set, submit, loading, fieldErrors, onMutation }: ModalFormProps) {
  if (!room) return null;

  return (
    <form
      className="space-y-3"
      onSubmit={submit(() =>
        onMutation((token) =>
          apiRequest(`/rooms/${room.id}/join`, token, {
            method: 'POST',
            body: JSON.stringify({
              position: Number(form.position),
              roomPassword: form.roomPassword || undefined,
            }),
          })
        )
      )}
    >
      <Field
        label="Posición 1 a 10"
        type="number"
        value={form.position || ''}
        onChange={set('position')}
        error={fieldErrors.position}
        required
      />
      {room.isPrivate && (
        <Field
          label="Contraseña de sala"
          type="password"
          value={form.roomPassword || ''}
          onChange={set('roomPassword')}
          error={fieldErrors.roomPassword}
          required
        />
      )}
      <button className="btn-primary w-full" disabled={loading}>
        Unirse
      </button>
    </form>
  );
}

export function MovePlayerForm({ room, player, form, set, submit, loading, fieldErrors, onMutation }: ModalFormProps) {
  if (!room || !player) return null;

  return (
    <form
      className="space-y-3"
      onSubmit={submit(() =>
        onMutation((token) =>
          apiRequest(`/rooms/${room.id}/move`, token, {
            method: 'POST',
            body: JSON.stringify({ userId: player.user.id, position: Number(form.position) }),
          })
        )
      )}
    >
      <Field
        label={`Nueva posición para ${player.user.username}`}
        type="number"
        value={form.position || ''}
        onChange={set('position')}
        error={fieldErrors.position}
        required
      />
      <button className="btn-primary w-full" disabled={loading}>
        Mover
      </button>
    </form>
  );
}

export function PlayerActionForm({ modal, room, player, submit, loading, onMutation }: ModalFormProps) {
  if (!room || !player || (modal !== 'kick' && modal !== 'transfer')) return null;

  const path = modal === 'kick' ? 'kick' : 'transfer';

  return (
    <form
      className="space-y-3"
      onSubmit={submit(() =>
        onMutation((token) =>
          apiRequest(`/rooms/${room.id}/${path}`, token, {
            method: 'POST',
            body: JSON.stringify({ userId: player.user.id }),
          })
        )
      )}
    >
      <p className="text-sm text-zinc-300">{player.user.username}</p>
      <button className="btn-primary w-full" disabled={loading}>
        Confirmar
      </button>
    </form>
  );
}

export function RoomLifecycleForm({ modal, room, submit, loading, onMutation }: ModalFormProps) {
  if (!room || (modal !== 'leave' && modal !== 'close')) return null;

  return (
    <form
      className="space-y-3"
      onSubmit={submit(() =>
        onMutation((token) =>
          apiRequest(`/rooms/${room.id}/${modal === 'close' ? 'close' : 'leave'}`, token, { method: 'POST' })
        )
      )}
    >
      <p className="text-sm text-zinc-300">Esta acción se aplica inmediatamente.</p>
      <button className="btn-danger w-full" disabled={loading}>
        Confirmar
      </button>
    </form>
  );
}
