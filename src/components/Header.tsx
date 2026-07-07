import { initials } from '../helpers';
import type { UserProfile } from '../types';

type AppHeaderProps = {
  profile: UserProfile | null;
  onLogin: () => void;
  onRegister: () => void;
  onResetPassword: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
};

export function AppHeader({
  profile,
  onLogin,
  onRegister,
  onResetPassword,
  onEditProfile,
  onChangePassword,
  onLogout,
}: AppHeaderProps) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-yellow-500/60 bg-black px-8 shadow-lg">
      <div className="text-3xl font-black text-yellow-400">CS1.6 5YA!</div>
      {profile ? (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold">
            {initials(profile.firstName, profile.lastName)}
          </div>
          <span className="font-semibold">{profile.username}</span>
          <button className="btn-secondary" onClick={onEditProfile}>
            Mi perfil
          </button>
          <button className="btn-secondary" onClick={onChangePassword}>
            Cambiar contraseña
          </button>
          <button className="btn-primary" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onRegister}>
            Registrarse
          </button>
          <button className="btn-secondary" onClick={onResetPassword}>
            Recuperar contraseña
          </button>
          <button className="btn-primary" onClick={onLogin}>
            Iniciar sesión
          </button>
        </div>
      )}
    </header>
  );
}
