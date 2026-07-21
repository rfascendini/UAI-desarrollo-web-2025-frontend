import { AppModal } from './components/AppModal';
import { AppHeader } from './components/Header';
import { useAppModalActions } from './hooks/useAppModalActions';
import { useRoomsSession } from './hooks/useRoomsSession';
import { RoomsPage } from './pages/RoomsPage';

function App() {
  const roomsSession = useRoomsSession();
  const modalActions = useAppModalActions({
    profile: roomsSession.profile,
    refresh: roomsSession.refresh,
    getToken: roomsSession.getToken,
    setError: roomsSession.setError,
    setNotice: roomsSession.setNotice,
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070b12] text-white">
      <AppHeader
        profile={roomsSession.profile}
        onLogin={() => modalActions.openModal('login')}
        onRegister={() => modalActions.openModal('register')}
        onResetPassword={() => modalActions.openModal('reset')}
        onEditProfile={() => modalActions.openModal('profile')}
        onChangePassword={() => modalActions.openModal('password')}
        onLogout={roomsSession.logout}
      />

      <RoomsPage
        profile={roomsSession.profile}
        rooms={roomsSession.rooms}
        canCreate={roomsSession.canCreate}
        error={roomsSession.error}
        notice={roomsSession.notice}
        onCreate={() => modalActions.openModal('create')}
        onJoin={(room) => modalActions.openRoomModal(room, 'join')}
        onLeave={(room) => modalActions.openRoomModal(room, room.isHost ? 'close' : 'leave')}
        onEdit={(room) => modalActions.openRoomModal(room, 'edit')}
        onMove={(room, player) => modalActions.openPlayerModal(room, player, 'move')}
        onKick={(room, player) => modalActions.openPlayerModal(room, player, 'kick')}
        onTransfer={(room, player) => modalActions.openPlayerModal(room, player, 'transfer')}
        onCopy={roomsSession.copyCommand}
      />

      {modalActions.modal && <AppModal {...modalActions.appModalProps} />}
    </div>
  );
}

export default App;
