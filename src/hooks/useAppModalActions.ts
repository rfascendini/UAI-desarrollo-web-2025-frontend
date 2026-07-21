import { useState } from 'react';
import {
  EmailAuthProvider,
  type AuthError,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { ApiError, apiRequest, publicApiRequest, type FieldErrors } from '../api/api';
import type { AppModalProps } from '../components/forms/formTypes';
import { auth } from '../firebase';
import type { ModalName, Player, Room, UserProfile } from '../types';

type UseAppModalActionsParams = {
  profile: UserProfile | null;
  refresh: () => Promise<void>;
  getToken: () => Promise<string>;
  setError: (message: string) => void;
  setNotice: (message: string) => void;
};

export function useAppModalActions({
  profile,
  refresh,
  getToken,
  setError,
  setNotice,
}: UseAppModalActionsParams) {
  const [modal, setModal] = useState<ModalName>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalError, setModalError] = useState('');
  const [modalFieldErrors, setModalFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearModalErrors = () => {
    setModalError('');
    setModalFieldErrors({});
  };

  const clearModalFieldError = (field: string) => {
    setModalFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setModalApiError = (err: unknown, fallback: string, fieldErrors: FieldErrors = {}) => {
    if (err instanceof ApiError) {
      setModalError(err.message || fallback);
      setModalFieldErrors(err.errors);
      return;
    }

    setModalError(fallback);
    setModalFieldErrors(fieldErrors);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedRoom(null);
    setSelectedPlayer(null);
    clearModalErrors();
  };

  const openModal = (nextModal: Exclude<ModalName, null>) => {
    setModal(nextModal);
  };

  const openRoomModal = (room: Room, nextModal: Exclude<ModalName, null>) => {
    setSelectedRoom(room);
    setModal(nextModal);
  };

  const openPlayerModal = (room: Room, player: Player, nextModal: Exclude<ModalName, null>) => {
    setSelectedRoom(room);
    setSelectedPlayer(player);
    setModal(nextModal);
  };

  const runMutation = async (action: (token: string) => Promise<void>) => {
    setLoading(true);
    setError('');
    clearModalErrors();
    try {
      const token = await getToken();
      await action(token);
      closeModal();
      await refresh();
    } catch (err) {
      setModalApiError(err, 'No se pudo completar la acción.');
    } finally {
      setLoading(false);
    }
  };

  const appModalProps: AppModalProps = {
    modal,
    room: selectedRoom,
    player: selectedPlayer,
    profile,
    loading,
    onClose: closeModal,
    formError: modalError,
    fieldErrors: modalFieldErrors,
    onClearFieldError: clearModalFieldError,
    onLogin: async (email, password) => {
      setLoading(true);
      clearModalErrors();
      try {
        await signInWithEmailAndPassword(auth, email, password);
        closeModal();
        await refresh();
      } catch {
        setModalError('El correo electrónico o la contraseña son incorrectos.');
      } finally {
        setLoading(false);
      }
    },
    onRegister: async (payload) => {
      setLoading(true);
      clearModalErrors();
      try {
        await publicApiRequest('/users/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        await signInWithEmailAndPassword(auth, payload.email, payload.password);
        closeModal();
        await refresh();
      } catch (err) {
        setModalApiError(err, 'No se pudo registrar.');
      } finally {
        setLoading(false);
      }
    },
    onReset: async (email) => {
      setLoading(true);
      clearModalErrors();
      try {
        await sendPasswordResetEmail(auth, email);
        setNotice('Te enviamos el correo de recuperación.');
        closeModal();
      } catch {
        setModalError('No se pudo enviar el correo de recuperación.');
      } finally {
        setLoading(false);
      }
    },
    onMutation: runMutation,
    onDeleteAccount: async (password) => {
      if (!auth.currentUser || !profile) return;
      setLoading(true);
      clearModalErrors();
      try {
        const credential = EmailAuthProvider.credential(profile.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
        const token = await auth.currentUser.getIdToken();
        await apiRequest('/users/me', token, { method: 'DELETE' });
        await signOut(auth);
        closeModal();
      } catch {
        setModalError('No se pudo eliminar la cuenta. Revisá la contraseña.');
        setModalFieldErrors({ deletePassword: ['La contraseña actual no es correcta.'] });
      } finally {
        setLoading(false);
      }
    },
    onChangePassword: async (currentPassword, newPassword) => {
      if (!auth.currentUser || !profile) return;
      setLoading(true);
      clearModalErrors();
      try {
        const credential = EmailAuthProvider.credential(profile.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        setNotice('Contraseña actualizada.');
        closeModal();
      } catch (err) {
        const authError = err as AuthError;
        if (authError.code === 'auth/weak-password') {
          setModalFieldErrors({ newPassword: ['La contraseña debe tener al menos 8 caracteres.'] });
          setModalError('Revisá los datos ingresados.');
        } else {
          setModalFieldErrors({ currentPassword: ['La contraseña actual no es correcta.'] });
          setModalError('No se pudo actualizar la contraseña.');
        }
      } finally {
        setLoading(false);
      }
    },
  };

  return {
    modal,
    appModalProps,
    openModal,
    openRoomModal,
    openPlayerModal,
  };
}
