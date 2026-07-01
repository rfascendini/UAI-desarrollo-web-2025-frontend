import { Field } from '../Field';
import type { AppModalProps, FieldSetter, FormState, SubmitFactory } from './formTypes';

type AuthFormProps = {
  form: FormState;
  set: FieldSetter;
  submit: SubmitFactory;
  loading: boolean;
};

export function LoginForm({
  form,
  set,
  submit,
  loading,
  onLogin,
}: AuthFormProps & Pick<AppModalProps, 'onLogin'>) {
  return (
    <form className="space-y-3" onSubmit={submit(() => onLogin(form.email, form.password))}>
      <Field label="Email" type="email" value={form.email || ''} onChange={set('email')} required />
      <Field label="Password" type="password" value={form.password || ''} onChange={set('password')} required />
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
      <Field label="Nombre" value={form.firstName || ''} onChange={set('firstName')} required />
      <Field label="Apellido" value={form.lastName || ''} onChange={set('lastName')} required />
      <Field label="Username" value={form.username || ''} onChange={set('username')} required />
      <Field label="Email" type="email" value={form.email || ''} onChange={set('email')} required />
      <Field label="Password" type="password" value={form.password || ''} onChange={set('password')} required />
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
  onReset,
}: AuthFormProps & Pick<AppModalProps, 'onReset'>) {
  return (
    <form className="space-y-3" onSubmit={submit(() => onReset(form.email))}>
      <Field label="Email" type="email" value={form.email || ''} onChange={set('email')} required />
      <button className="btn-primary w-full" disabled={loading}>
        Enviar recuperacion
      </button>
    </form>
  );
}
