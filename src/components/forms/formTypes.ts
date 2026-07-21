import type { FormEvent } from 'react';
import type { FieldErrors } from '../../api/api';
import type { ModalName, Player, Room, UserProfile } from '../../types';

// Tipos compartidos por los formularios que se muestran dentro de AppModal.
export type MutationRunner = (action: (token: string) => Promise<void>) => Promise<void>;

export type AppModalProps = {
  modal: ModalName;
  room: Room | null;
  player: Player | null;
  profile: UserProfile | null;
  loading: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onReset: (email: string) => Promise<void>;
  onMutation: MutationRunner;
  onDeleteAccount: (password: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  formError: string;
  fieldErrors: FieldErrors;
  onClearFieldError: (field: string) => void;
};

export type FormState = Record<string, string>;
export type FieldSetter = (key: string) => (value: string) => void;
export type SubmitFactory = (handler: () => Promise<void>) => (event: FormEvent) => void;

export type ModalFormProps = AppModalProps & {
  form: FormState;
  set: FieldSetter;
  submit: SubmitFactory;
  fieldErrors: FieldErrors;
};
