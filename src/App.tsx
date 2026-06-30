import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { apiRequest, publicApiRequest } from './api/client';
import { auth } from './firebase';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

type Player = {
  user: Pick<UserProfile, 'id' | 'firstName' | 'lastName' | 'username'>;
  position: number;
};

type Room = {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  playerCount: number;
  max_players: number;
  createdBy: Player['user'];
  users: Player[];
  isMember: boolean;
  isHost: boolean;
  connection: null | {
    serverIP: string;
    serverPort: number;
    serverPassword: string;
    command: string;
    steamUrl: string;
  };
};

type ModalName =
  | 'login'
  | 'register'
  | 'reset'
  | 'profile'
  | 'password'
  | 'delete'
  | 'create'
  | 'edit'
  | 'join'
  | 'move'
  | 'kick'
  | 'transfer'
  | 'close'
  | 'leave'
  | null;

const initials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'CS';

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-md border border-yellow-500/60 bg-zinc-950 p-5 shadow-2xl shadow-black">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-yellow-400">{title}</h2>
          <button className="text-2xl leading-none text-zinc-400 hover:text-white" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-zinc-200">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-yellow-500"
      />
    </label>
  );
}

function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modal, setModal] = useState<ModalName>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(false);

  const myRoom = rooms.find((room) => room.isMember) || null;
  const canCreate = Boolean(profile && !myRoom);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) throw new Error('Tenes que iniciar sesion.');
    return auth.currentUser.getIdToken();
  }, []);

  const refresh = useCallback(async () => {
    if (!auth.currentUser || pollingRef.current) return;
    pollingRef.current = true;
    try {
      const token = await auth.currentUser.getIdToken();
      const data = await apiRequest<{ rooms: Room[] }>('/rooms', token);
      setRooms(data.rooms);
      const me = await apiRequest<{ user: UserProfile }>('/users/me', token);
      setProfile(me.user);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron actualizar las salas.');
    } finally {
      pollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setRooms([]);
        return;
      }
      await refresh();
    });
  }, [refresh]);

  useEffect(() => {
    if (!firebaseUser) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [firebaseUser, refresh]);

  useEffect(() => {
    const handler = () => {
      if (!myRoom || !firebaseUser) return;
      void firebaseUser.getIdToken().then((token) => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/rooms/${myRoom.id}/leave`, {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => undefined);
      });
    };
    window.addEventListener('pagehide', handler);
    return () => window.removeEventListener('pagehide', handler);
  }, [firebaseUser, myRoom]);

  const runMutation = async (action: (token: string) => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      await action(token);
      setModal(null);
      setSelectedRoom(null);
      setSelectedPlayer(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la accion.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (myRoom) {
      await runMutation((token) => apiRequest(`/rooms/${myRoom.id}/leave`, token, { method: 'POST' }));
    }
    await signOut(auth);
  };

  const orderedRooms = useMemo(
    () => [...rooms].sort((a, b) => Number(b.isMember) - Number(a.isMember)),
    [rooms]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070b12] text-white">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-yellow-500/60 bg-black px-8 shadow-lg">
        <div className="text-3xl font-black text-yellow-400">CS1.6 Play</div>
        {profile ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold">
              {initials(profile.firstName, profile.lastName)}
            </div>
            <span className="font-semibold">{profile.username}</span>
            <button className="btn-secondary" onClick={() => setModal('profile')}>
              Mi perfil
            </button>
            <button className="btn-secondary" onClick={() => setModal('password')}>
              Cambiar password
            </button>
            <button className="btn-danger" onClick={() => setModal('delete')}>
              Eliminar cuenta
            </button>
            <button className="btn-primary" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setModal('register')}>
              Registrarse
            </button>
            <button className="btn-secondary" onClick={() => setModal('reset')}>
              Recuperar password
            </button>
            <button className="btn-primary" onClick={() => setModal('login')}>
              Iniciar sesion
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Salas disponibles</h1>
            <p className="text-sm text-zinc-400">Equipos 5 vs 5, maximo 10 jugadores por sala.</p>
          </div>
          {profile && (
            <button className="btn-primary" disabled={!canCreate} onClick={() => setModal('create')}>
              Crear sala
            </button>
          )}
        </div>

        {error && <div className="mb-3 rounded border border-red-500 bg-red-950/60 px-3 py-2 text-sm">{error}</div>}
        {notice && <div className="mb-3 rounded border border-emerald-500 bg-emerald-950/60 px-3 py-2 text-sm">{notice}</div>}

        <section className="min-h-0 flex-1 overflow-y-auto pr-2">
          {!profile && (
            <div className="rounded border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-300">
              Inicia sesion para ver y crear salas.
            </div>
          )}
          {profile && orderedRooms.length === 0 && (
            <div className="rounded border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center text-zinc-300">
              Todavia no hay salas activas.
            </div>
          )}
          {orderedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={() => {
                setSelectedRoom(room);
                setModal('join');
              }}
              onLeave={() => {
                setSelectedRoom(room);
                setModal(room.isHost ? 'close' : 'leave');
              }}
              onEdit={() => {
                setSelectedRoom(room);
                setModal('edit');
              }}
              onMove={(player) => {
                setSelectedRoom(room);
                setSelectedPlayer(player);
                setModal('move');
              }}
              onKick={(player) => {
                setSelectedRoom(room);
                setSelectedPlayer(player);
                setModal('kick');
              }}
              onTransfer={(player) => {
                setSelectedRoom(room);
                setSelectedPlayer(player);
                setModal('transfer');
              }}
              onCopy={(command) => {
                navigator.clipboard
                  .writeText(command)
                  .then(() => setNotice('Comando copiado.'))
                  .catch(() => setError('No se pudo copiar el comando.'));
              }}
            />
          ))}
        </section>
      </main>

      {modal && (
        <AppModal
          modal={modal}
          room={selectedRoom}
          player={selectedPlayer}
          profile={profile}
          loading={loading}
          onClose={() => {
            setModal(null);
            setError('');
          }}
          onLogin={async (email, password) => {
            setLoading(true);
            setError('');
            try {
              await signInWithEmailAndPassword(auth, email, password);
              setModal(null);
              await refresh();
            } catch {
              setError('Email o password incorrectos.');
            } finally {
              setLoading(false);
            }
          }}
          onRegister={async (payload) => {
            setLoading(true);
            setError('');
            try {
              await publicApiRequest('/users/register', {
                method: 'POST',
                body: JSON.stringify(payload),
              });
              await signInWithEmailAndPassword(auth, payload.email, payload.password);
              setModal(null);
              await refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'No se pudo registrar.');
            } finally {
              setLoading(false);
            }
          }}
          onReset={async (email) => {
            await sendPasswordResetEmail(auth, email);
            setNotice('Te enviamos el email de recuperacion.');
            setModal(null);
          }}
          onMutation={runMutation}
          onDeleteAccount={async (password) => {
            if (!auth.currentUser || !profile) return;
            setLoading(true);
            setError('');
            try {
              const credential = EmailAuthProvider.credential(profile.email, password);
              await reauthenticateWithCredential(auth.currentUser, credential);
              const token = await auth.currentUser.getIdToken();
              await apiRequest('/users/me', token, { method: 'DELETE' });
              await signOut(auth);
              setModal(null);
            } catch {
              setError('No se pudo eliminar la cuenta. Revisa el password.');
            } finally {
              setLoading(false);
            }
          }}
          onChangePassword={async (currentPassword, newPassword) => {
            if (!auth.currentUser || !profile) return;
            const credential = EmailAuthProvider.credential(profile.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);
            setNotice('Password actualizado.');
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function RoomCard({
  room,
  onJoin,
  onLeave,
  onEdit,
  onMove,
  onKick,
  onTransfer,
  onCopy,
}: {
  room: Room;
  onJoin: () => void;
  onLeave: () => void;
  onEdit: () => void;
  onMove: (player: Player) => void;
  onKick: (player: Player) => void;
  onTransfer: (player: Player) => void;
  onCopy: (command: string) => void;
}) {
  const slots = Array.from({ length: 10 }, (_, index) => {
    const position = index + 1;
    return room.users.find((player) => player.position === position) || null;
  });
  const full = room.playerCount >= 10;
  const border = room.isMember ? 'border-emerald-500 shadow-emerald-900/30' : 'border-blue-500/70 shadow-blue-950/30';

  return (
    <article className={`mb-4 rounded-md border-2 ${border} bg-zinc-950 p-4 shadow-xl`}>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{room.name}</h2>
            {room.isMember && <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold">Tu sala</span>}
            {room.isPrivate && <span className="rounded bg-yellow-600 px-2 py-0.5 text-xs font-bold">Privada</span>}
          </div>
          {room.description && <p className="text-sm text-zinc-400">{room.description}</p>}
          <p className="text-sm text-zinc-300">Anfitrion: {room.createdBy.username}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-yellow-400">{room.playerCount}/10</p>
          <p className="text-xs text-zinc-500">{full ? 'Sala completa' : 'Esperando jugadores'}</p>
        </div>
      </div>

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

      {room.connection ? (
        <div className="mt-3 rounded border border-emerald-700 bg-emerald-950/30 p-3 text-sm">
          <p className="font-mono">connect {room.connection.serverIP}:{room.connection.serverPort}</p>
          {room.connection.serverPassword && <p>Password: {room.connection.serverPassword}</p>}
          <div className="mt-2 flex gap-2">
            <button className="btn-secondary" onClick={() => onCopy(room.connection!.command)}>
              Copiar comando
            </button>
            <a className="btn-primary" href={room.connection.steamUrl}>
              Conectarse al servidor
            </a>
          </div>
        </div>
      ) : room.isMember ? (
        <p className="mt-3 text-sm text-zinc-400">Los datos del servidor se habilitan al llegar a 10 jugadores.</p>
      ) : null}

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
                <button className="mini-btn" onClick={() => onMove(player)}>Mover {player.user.username}</button>
                <button className="mini-btn" onClick={() => onKick(player)}>Expulsar</button>
                <button className="mini-btn" onClick={() => onTransfer(player)}>Transferir</button>
              </span>
            ))}
      </div>
    </article>
  );
}

function AppModal(props: {
  modal: ModalName;
  room: Room | null;
  player: Player | null;
  profile: UserProfile | null;
  loading: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: { firstName: string; lastName: string; username: string; email: string; password: string }) => Promise<void>;
  onReset: (email: string) => Promise<void>;
  onMutation: (action: (token: string) => Promise<void>) => Promise<void>;
  onDeleteAccount: (password: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const set = (key: string) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (handler: () => Promise<void>) => (event: FormEvent) => {
    event.preventDefault();
    void handler();
  };

  if (props.modal === 'login') {
    return (
      <Modal title="Iniciar sesion" onClose={props.onClose}>
        <form className="space-y-3" onSubmit={submit(() => props.onLogin(form.email, form.password))}>
          <Field label="Email" type="email" value={form.email || ''} onChange={set('email')} required />
          <Field label="Password" type="password" value={form.password || ''} onChange={set('password')} required />
          <button className="btn-primary w-full" disabled={props.loading}>Ingresar</button>
        </form>
      </Modal>
    );
  }

  if (props.modal === 'register') {
    return (
      <Modal title="Crear cuenta" onClose={props.onClose}>
        <form
          className="space-y-3"
          onSubmit={submit(() =>
            props.onRegister({
              firstName: form.firstName,
              lastName: form.lastName,
              username: form.username,
              email: form.email,
              password: form.password,
            })
          )}
        >
          <Field label="Nombre" value={form.firstName || ''} onChange={set('firstName')} required />
          <Field label="Apellido" value={form.lastName || ''} onChange={set('lastName')} required />
          <Field label="Username" value={form.username || ''} onChange={set('username')} required />
          <Field label="Email" type="email" value={form.email || ''} onChange={set('email')} required />
          <Field label="Password" type="password" value={form.password || ''} onChange={set('password')} required />
          <button className="btn-primary w-full" disabled={props.loading}>Registrarse</button>
        </form>
      </Modal>
    );
  }

  const title = {
    reset: 'Recuperar password',
    profile: 'Mi perfil',
    password: 'Cambiar password',
    delete: 'Eliminar cuenta',
    create: 'Crear sala',
    edit: 'Editar sala',
    join: 'Unirse a sala',
    move: 'Mover jugador',
    kick: 'Expulsar jugador',
    transfer: 'Transferir liderazgo',
    close: 'Cerrar sala',
    leave: 'Abandonar sala',
  }[props.modal || 'create'];

  return (
    <Modal title={title} onClose={props.onClose}>
      <DynamicForm {...props} form={form} set={set} submit={submit} />
    </Modal>
  );
}

function DynamicForm({
  modal,
  room,
  player,
  profile,
  loading,
  form,
  set,
  submit,
  onMutation,
  onReset,
  onDeleteAccount,
  onChangePassword,
}: Parameters<typeof AppModal>[0] & {
  form: Record<string, string>;
  set: (key: string) => (value: string) => void;
  submit: (handler: () => Promise<void>) => (event: FormEvent) => void;
}) {
  if (modal === 'profile' && profile) {
    return (
      <form className="space-y-3" onSubmit={submit(() => onMutation((token) => apiRequest('/users/me', token, { method: 'PATCH', body: JSON.stringify({
        firstName: form.firstName || profile.firstName,
        lastName: form.lastName || profile.lastName,
        username: form.username || profile.username,
      }) })))}>
        <Field label="Nombre" value={form.firstName ?? profile.firstName} onChange={set('firstName')} required />
        <Field label="Apellido" value={form.lastName ?? profile.lastName} onChange={set('lastName')} required />
        <Field label="Username" value={form.username ?? profile.username} onChange={set('username')} required />
        <button className="btn-primary w-full" disabled={loading}>Guardar</button>
        <button type="button" className="btn-danger w-full" onClick={() => set('danger')('1')}>Zona de peligro</button>
      </form>
    );
  }

  if (modal === 'password') {
    return (
      <form className="space-y-3" onSubmit={submit(() => onChangePassword(form.currentPassword, form.newPassword))}>
        <Field label="Password actual" type="password" value={form.currentPassword || ''} onChange={set('currentPassword')} required />
        <Field label="Password nuevo" type="password" value={form.newPassword || ''} onChange={set('newPassword')} required />
        <button className="btn-primary w-full" disabled={loading}>Actualizar</button>
      </form>
    );
  }

  if (modal === 'create' || modal === 'edit') {
    return (
      <form className="space-y-3" onSubmit={submit(() => onMutation((token) => apiRequest(modal === 'create' ? '/rooms' : `/rooms/${room?.id}`, token, {
        method: modal === 'create' ? 'POST' : 'PATCH',
        body: JSON.stringify({
          name: form.name || room?.name,
          description: form.description ?? room?.description ?? '',
          isPrivate: form.isPrivate === 'true',
          roomPassword: form.roomPassword || undefined,
          serverIP: form.serverIP || room?.connection?.serverIP || '',
          serverPort: Number(form.serverPort || room?.connection?.serverPort || 27015),
          serverPassword: form.serverPassword || undefined,
        }),
      })))}>
        <Field label="Nombre" value={form.name ?? room?.name ?? ''} onChange={set('name')} required />
        <Field label="Descripcion" value={form.description ?? room?.description ?? ''} onChange={set('description')} />
        <Field label="IP del servidor" value={form.serverIP ?? room?.connection?.serverIP ?? ''} onChange={set('serverIP')} required />
        <Field label="Puerto" type="number" value={form.serverPort ?? String(room?.connection?.serverPort ?? 27015)} onChange={set('serverPort')} required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" onChange={(e) => set('isPrivate')(String(e.target.checked))} /> Sala privada</label>
        <Field label="Password de sala privada" type="password" value={form.roomPassword || ''} onChange={set('roomPassword')} />
        <Field label="Password del servidor" type="password" value={form.serverPassword || ''} onChange={set('serverPassword')} />
        <button className="btn-primary w-full" disabled={loading}>{modal === 'create' ? 'Crear' : 'Guardar'}</button>
      </form>
    );
  }

  if (modal === 'join' && room) {
    return (
      <form className="space-y-3" onSubmit={submit(() => onMutation((token) => apiRequest(`/rooms/${room.id}/join`, token, { method: 'POST', body: JSON.stringify({
        position: Number(form.position),
        roomPassword: form.roomPassword || undefined,
      }) })))}>
        <Field label="Posicion 1 a 10" type="number" value={form.position || ''} onChange={set('position')} required />
        {room.isPrivate && <Field label="Password de sala" type="password" value={form.roomPassword || ''} onChange={set('roomPassword')} required />}
        <button className="btn-primary w-full" disabled={loading}>Unirse</button>
      </form>
    );
  }

  if (modal === 'move' && room && player) {
    return (
      <form className="space-y-3" onSubmit={submit(() => onMutation((token) => apiRequest(`/rooms/${room.id}/move`, token, { method: 'POST', body: JSON.stringify({ userId: player.user.id, position: Number(form.position) }) })))}>
        <Field label={`Nueva posicion para ${player.user.username}`} type="number" value={form.position || ''} onChange={set('position')} required />
        <button className="btn-primary w-full" disabled={loading}>Mover</button>
      </form>
    );
  }

  if ((modal === 'kick' || modal === 'transfer') && room && player) {
    const path = modal === 'kick' ? 'kick' : 'transfer';
    return (
      <form className="space-y-3" onSubmit={submit(() => onMutation((token) => apiRequest(`/rooms/${room.id}/${path}`, token, { method: 'POST', body: JSON.stringify({ userId: player.user.id }) })))}>
        <p className="text-sm text-zinc-300">{player.user.username}</p>
        <button className="btn-primary w-full" disabled={loading}>Confirmar</button>
      </form>
    );
  }

  if ((modal === 'leave' || modal === 'close') && room) {
    return (
      <form className="space-y-3" onSubmit={submit(() => onMutation((token) => apiRequest(`/rooms/${room.id}/${modal === 'close' ? 'close' : 'leave'}`, token, { method: 'POST' })))}>
        <p className="text-sm text-zinc-300">Esta accion se aplica inmediatamente.</p>
        <button className="btn-danger w-full" disabled={loading}>Confirmar</button>
      </form>
    );
  }

  if (modal === 'reset') {
    return (
      <form className="space-y-3" onSubmit={submit(() => onReset(form.email))}>
        <Field label="Email" type="email" value={form.email || ''} onChange={set('email')} required />
        <button className="btn-primary w-full" disabled={loading}>Enviar recuperacion</button>
      </form>
    );
  }

  if (modal === 'delete') {
    return (
      <form className="space-y-3" onSubmit={submit(() => onDeleteAccount(form.password))}>
        <Field label="Password actual" type="password" value={form.password || ''} onChange={set('password')} required />
        <button className="btn-danger w-full" disabled={loading}>Eliminar cuenta</button>
      </form>
    );
  }

  return null;
}

export default App;
