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
  reset: 'Recuperar contraseña',
  profile: 'Mi perfil',
  password: 'Cambiar contraseña',
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
  const set = (key: string) => (value: string) => {
    props.onClearFieldError(key);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (handler: () => Promise<void>) => (event: FormEvent) => {
    event.preventDefault();
    void handler();
  };

  if (props.modal === 'login') {
    return (
      <Modal title="Iniciar sesión" onClose={props.onClose}>
        <FormError message={props.formError} />
        <LoginForm
          form={form}
          set={set}
          submit={submit}
          loading={props.loading}
          onLogin={props.onLogin}
          fieldErrors={props.fieldErrors}
        />
      </Modal>
    );
  }

  if (props.modal === 'register') {
    return (
      <Modal title="Crear cuenta" onClose={props.onClose}>
        <FormError message={props.formError} />
        <RegisterForm
          form={form}
          set={set}
          submit={submit}
          loading={props.loading}
          onRegister={props.onRegister}
          fieldErrors={props.fieldErrors}
        />
      </Modal>
    );
  }

  const title = MODAL_TITLES[props.modal || 'create'];

  return (
    <Modal title={title} onClose={props.onClose}>
      <FormError message={props.formError} />
      <ModalContent {...props} form={form} set={set} submit={submit} />
    </Modal>
  );
}

function FormError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="mb-3 rounded border border-red-500 bg-red-950/70 px-3 py-2 text-sm text-red-100" role="alert">
      {message}
    </div>
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
