import { AppModal } from './components/AppModal';
import { AppHeader } from './components/Header';
import { PrivateRoute } from './components/PrivateRoute';
import { useAppSession } from './context/useAppSession';
import { useAppModalActions } from './hooks/useAppModalActions';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const roomsSession = useAppSession();
  const modalActions = useAppModalActions({
    profile: roomsSession.profile,
    refresh: roomsSession.refresh,
    getToken: roomsSession.getToken,
    setError: roomsSession.setError,
    setNotice: roomsSession.setNotice,
    onAuthSuccess: () => navigate('/salas', { replace: true }),
  });

  const logout = async () => {
    await roomsSession.logout();
    navigate('/', { replace: true });
  };

  const goToAuth = (path: '/login' | '/registro') => {
    modalActions.clearModalErrors();
    navigate(path);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070b12] text-white">
      <AppHeader
        profile={roomsSession.profile}
        onLogin={() => goToAuth('/login')}
        onRegister={() => goToAuth('/registro')}
        onResetPassword={() => modalActions.openModal('reset')}
        onEditProfile={() => modalActions.openModal('profile')}
        onChangePassword={() => modalActions.openModal('password')}
        onLogout={logout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              profileExists={Boolean(roomsSession.profile)}
              onPrivateAccess={() => {
                if (roomsSession.profile) {
                  navigate('/salas');
                  return;
                }
                goToAuth('/login');
              }}
            />
          }
        />
        <Route
          path="/login"
          element={
            <AuthPage
              mode="login"
              profile={roomsSession.profile}
              authProps={modalActions.appModalProps}
              onRouteEnter={modalActions.clearModalErrors}
            />
          }
        />
        <Route
          path="/registro"
          element={
            <AuthPage
              mode="register"
              profile={roomsSession.profile}
              authProps={modalActions.appModalProps}
              onRouteEnter={modalActions.clearModalErrors}
            />
          }
        />
        <Route
          path="/salas"
          element={
            <PrivateRoute>
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
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {modalActions.modal && <AppModal {...modalActions.appModalProps} />}
    </div>
  );
}

export default App;
