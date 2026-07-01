import { useState } from 'react';
import type { FormEvent } from 'react';
import { LoginForm, RegisterForm, ResetPasswordForm } from './forms/AuthForms';
import { ChangePasswordForm, ProfileForm } from './forms/ProfileForms';
import {
  JoinRoomForm,
  MovePlayerForm,
  PlayerActionForm,
  RoomForm,
  RoomLifecycleForm,
} from './forms/RoomForms';
import { Modal } from './Modal';
import type { AppModalProps, FormState } from './forms/formTypes';

const MODAL_TITLES = {
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
} as const;

export function AppModal(props: AppModalProps) {
  const [form, setForm] = useState<FormState>({});
  const set = (key: string) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (handler: () => Promise<void>) => (event: FormEvent) => {
    event.preventDefault();
    void handler();
  };

  if (props.modal === 'login') {
    return (
      <Modal title="Iniciar sesion" onClose={props.onClose}>
        <LoginForm
          form={form}
          set={set}
          submit={submit}
          loading={props.loading}
          onLogin={props.onLogin}
        />
      </Modal>
    );
  }

  if (props.modal === 'register') {
    return (
      <Modal title="Crear cuenta" onClose={props.onClose}>
        <RegisterForm
          form={form}
          set={set}
          submit={submit}
          loading={props.loading}
          onRegister={props.onRegister}
        />
      </Modal>
    );
  }

  const title = MODAL_TITLES[props.modal || 'create'];

  return (
    <Modal title={title} onClose={props.onClose}>
      <ModalContent {...props} form={form} set={set} submit={submit} />
    </Modal>
  );
}

function ModalContent(props: Parameters<typeof ProfileForm>[0]) {
  switch (props.modal) {
    case 'profile':
      return <ProfileForm {...props} />;
    case 'password':
      return <ChangePasswordForm {...props} />;
    case 'create':
    case 'edit':
      return <RoomForm {...props} />;
    case 'join':
      return <JoinRoomForm {...props} />;
    case 'move':
      return <MovePlayerForm {...props} />;
    case 'kick':
    case 'transfer':
      return <PlayerActionForm {...props} />;
    case 'leave':
    case 'close':
      return <RoomLifecycleForm {...props} />;
    case 'reset':
      return <ResetPasswordForm {...props} />;
    default:
      return null;
  }
}
