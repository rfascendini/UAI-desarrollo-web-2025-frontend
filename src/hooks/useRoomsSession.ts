import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { apiRequest } from '../api/api';
import { auth } from '../firebase';
import type { Room, UserProfile } from '../types';

export function useRoomsSession() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [initializing, setInitializing] = useState(true);
  const pollingRef = useRef(false);

  const myRoom = rooms.find((room) => room.isMember) || null;
  const canCreate = Boolean(profile && !myRoom);

  const orderedRooms = useMemo(
    () => [...rooms].sort((a, b) => Number(b.isMember) - Number(a.isMember)),
    [rooms]
  );

  const getToken = useCallback(async () => {
    if (!auth.currentUser) throw new Error('Tenés que iniciar sesión.');
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
        setInitializing(false);
        return;
      }
      await refresh();
      setInitializing(false);
    });
  }, [refresh]);

  useEffect(() => {
    if (!firebaseUser) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [firebaseUser, refresh]);

  const copyCommand = (command: string) => {
    navigator.clipboard
      .writeText(command)
      .then(() => setNotice('Comando copiado.'))
      .catch(() => setError('No se pudo copiar el comando.'));
  };

  const logout = async () => {
    await signOut(auth);
  };

  return {
    profile,
    rooms: orderedRooms,
    myRoom,
    canCreate,
    initializing,
    error,
    notice,
    refresh,
    getToken,
    setError,
    setNotice,
    copyCommand,
    logout,
  };
}
