import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { apiRequest, publicApiRequest } from './api/api';
import { AppModal } from './components/AppModal';
import { AppHeader } from './components/Header';
import { RoomsList } from './components/RoomsList';
import { auth } from './firebase';
import type { ModalName, Player, Room, UserProfile } from './types';

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
      closeModal();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la accion.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedRoom(null);
    setSelectedPlayer(null);
  };

  const selectRoomModal = (room: Room, nextModal: Exclude<ModalName, null>) => {
    setSelectedRoom(room);
    setModal(nextModal);
  };

  const selectPlayerModal = (room: Room, player: Player, nextModal: Exclude<ModalName, null>) => {
    setSelectedRoom(room);
    setSelectedPlayer(player);
    setModal(nextModal);
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
      <AppHeader
        profile={profile}
        onLogin={() => setModal('login')}
        onRegister={() => setModal('register')}
        onResetPassword={() => setModal('reset')}
        onEditProfile={() => setModal('profile')}
        onChangePassword={() => setModal('password')}
        onLogout={handleLogout}
      />

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

        <RoomsList
          profileExists={Boolean(profile)}
          rooms={orderedRooms}
          onJoin={(room) => selectRoomModal(room, 'join')}
          onLeave={(room) => selectRoomModal(room, room.isHost ? 'close' : 'leave')}
          onEdit={(room) => selectRoomModal(room, 'edit')}
          onMove={(room, player) => selectPlayerModal(room, player, 'move')}
          onKick={(room, player) => selectPlayerModal(room, player, 'kick')}
          onTransfer={(room, player) => selectPlayerModal(room, player, 'transfer')}
          onCopy={(command) => {
            navigator.clipboard
              .writeText(command)
              .then(() => setNotice('Comando copiado.'))
              .catch(() => setError('No se pudo copiar el comando.'));
          }}
        />
      </main>

      {modal && (
        <AppModal
          modal={modal}
          room={selectedRoom}
          player={selectedPlayer}
          profile={profile}
          loading={loading}
          onClose={() => {
            closeModal();
            setError('');
          }}
          onLogin={async (email, password) => {
            setLoading(true);
            setError('');
            try {
              await signInWithEmailAndPassword(auth, email, password);
              closeModal();
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
              closeModal();
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
            closeModal();
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
              closeModal();
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
            closeModal();
          }}
        />
      )}
    </div>
  );
}

export default App;
