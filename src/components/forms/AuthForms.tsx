import { Field } from '../Field';
import type { FieldErrors } from '../../api/api';
import type { AppModalProps, FieldSetter, FormState, SubmitFactory } from './formTypes';

type AuthFormProps = {
  form: FormState;
  set: FieldSetter;
  submit: SubmitFactory;
  loading: boolean;
  fieldErrors: FieldErrors;
};

export function LoginForm({
  form,
  set,
  submit,
  loading,
  fieldErrors,
  onLogin,
}: AuthFormProps & Pick<AppModalProps, 'onLogin'>) {
  return (
    <form className="space-y-3" onSubmit={submit(() => onLogin(form.email, form.password))}>
      <Field
        label="Correo electrónico"
        type="email"
        value={form.email || ''}
        onChange={set('email')}
        error={fieldErrors.email}
        required
      />
      <Field
        label="Contraseña"
        type="password"
        value={form.password || ''}
        onChange={set('password')}
        error={fieldErrors.password}
        required
      />
      <button className="btn-primary w-full" disabled={loading}>
        Ingresar
      </button>
    </form>
  );
}

export function RegisterForm({
  form,
  set,
  submit,
  loading,
  fieldErrors,
  onRegister,
}: AuthFormProps & Pick<AppModalProps, 'onRegister'>) {
  return (
    <form
      className="space-y-3"
      onSubmit={submit(() =>
        onRegister({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          password: form.password,
        })
      )}
    >
      <Field label="Nombre" value={form.firstName || ''} onChange={set('firstName')} error={fieldErrors.firstName} required />
      <Field label="Apellido" value={form.lastName || ''} onChange={set('lastName')} error={fieldErrors.lastName} required />
      <Field label="Usuario" value={form.username || ''} onChange={set('username')} error={fieldErrors.username} required />
      <Field
        label="Correo electrónico"
        type="email"
        value={form.email || ''}
        onChange={set('email')}
        error={fieldErrors.email}
        required
      />
      <Field
        label="Contraseña"
        type="password"
        value={form.password || ''}
        onChange={set('password')}
        error={fieldErrors.password}
        required
      />
      <button className="btn-primary w-full" disabled={loading}>
        Registrarse
      </button>
    </form>
  );
}

export function ResetPasswordForm({
  form,
  set,
  submit,
  loading,
  fieldErrors,
  onReset,
}: AuthFormProps & Pick<AppModalProps, 'onReset'>) {
  return (
    <form className="space-y-3" onSubmit={submit(() => onReset(form.email))}>
      <Field
        label="Correo electrónico"
        type="email"
        value={form.email || ''}
        onChange={set('email')}
        error={fieldErrors.email}
        required
      />
      <button className="btn-primary w-full" disabled={loading}>
        Enviar recuperacion
      </button>
    </form>
  );
}
