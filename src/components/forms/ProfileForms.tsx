import { apiRequest } from '../../api/api';
import { Field } from '../Field';
import type { ModalFormProps } from './formTypes';

export function ProfileForm({
  profile,
  form,
  set,
  submit,
  loading,
  onMutation,
  onDeleteAccount,
}: ModalFormProps) {
  if (!profile) return null;

  return (
    <form
      className="space-y-3"
      onSubmit={submit(() =>
        onMutation((token) =>
          apiRequest('/users/me', token, {
            method: 'PATCH',
            body: JSON.stringify({
              firstName: form.firstName || profile.firstName,
              lastName: form.lastName || profile.lastName,
              username: form.username || profile.username,
            }),
          })
        )
      )}
    >
      <Field label="Nombre" value={form.firstName ?? profile.firstName} onChange={set('firstName')} required />
      <Field label="Apellido" value={form.lastName ?? profile.lastName} onChange={set('lastName')} required />
      <Field label="Username" value={form.username ?? profile.username} onChange={set('username')} required />
      <button className="btn-primary w-full" disabled={loading}>
        Guardar
      </button>
      <div className="border-t border-zinc-800 pt-4">
        <p className="mb-2 text-sm font-bold text-red-300">Eliminar cuenta</p>
        <p className="mb-3 text-xs text-zinc-400">
          Para eliminar tu cuenta, ingresa tu password actual. Si sos anfitrion, tus salas activas se cierran.
        </p>
        <Field
          label="Password actual"
          type="password"
          value={form.deletePassword || ''}
          onChange={set('deletePassword')}
        />
        <button
          type="button"
          className="btn-danger mt-3 w-full"
          disabled={loading || !form.deletePassword}
          onClick={() => onDeleteAccount(form.deletePassword)}
        >
          Eliminar cuenta
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordForm({
  form,
  set,
  submit,
  loading,
  onChangePassword,
}: ModalFormProps) {
  return (
    <form className="space-y-3" onSubmit={submit(() => onChangePassword(form.currentPassword, form.newPassword))}>
      <Field
        label="Password actual"
        type="password"
        value={form.currentPassword || ''}
        onChange={set('currentPassword')}
        required
      />
      <Field
        label="Password nuevo"
        type="password"
        value={form.newPassword || ''}
        onChange={set('newPassword')}
        required
      />
      <button className="btn-primary w-full" disabled={loading}>
        Actualizar
      </button>
    </form>
  );
}
