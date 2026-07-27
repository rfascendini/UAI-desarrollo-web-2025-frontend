import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from '../components/forms/AuthForms';
import type { AppModalProps, FormState } from '../components/forms/formTypes';
import { usePageTitle } from '../hooks/usePageTitle';
import type { UserProfile } from '../types';

type AuthPageProps = {
  mode: 'login' | 'register';
  profile: UserProfile | null;
  authProps: AppModalProps;
  onRouteEnter: () => void;
};

export function AuthPage({ mode, profile, authProps, onRouteEnter }: AuthPageProps) {
  const [form, setForm] = useState<FormState>({});
  usePageTitle(mode === 'login' ? '5YA CS1.6 - Login' : '5YA CS1.6 - Registro');

  useEffect(() => {
    setForm({});
    onRouteEnter();
  }, [mode, onRouteEnter]);

  if (profile) {
    return <Navigate to="/salas" replace />;
  }

  const set = (key: string) => (value: string) => {
    authProps.onClearFieldError(key);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (handler: () => Promise<void>) => (event: FormEvent) => {
    event.preventDefault();
    void handler();
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
      <section className="rounded-md border border-yellow-500/60 bg-zinc-950 p-5 shadow-2xl shadow-black">
        <h1 className="mb-1 text-xl font-bold text-yellow-400">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>
        <p className="mb-4 text-sm text-zinc-400">
          {mode === 'login' ? 'Entrar a la ruta privada de salas.' : 'Registrate para administrar salas.'}
        </p>

        {authProps.formError && (
          <div className="mb-3 rounded border border-red-500 bg-red-950/70 px-3 py-2 text-sm text-red-100" role="alert">
            {authProps.formError}
          </div>
        )}

        {mode === 'login' ? (
          <LoginForm
            form={form}
            set={set}
            submit={submit}
            loading={authProps.loading}
            onLogin={authProps.onLogin}
            fieldErrors={authProps.fieldErrors}
          />
        ) : (
          <RegisterForm
            form={form}
            set={set}
            submit={submit}
            loading={authProps.loading}
            onRegister={authProps.onRegister}
            fieldErrors={authProps.fieldErrors}
          />
        )}

        <div className="mt-4 text-center text-sm text-zinc-400">
          {mode === 'login' ? (
            <Link className="font-bold text-yellow-400" to="/registro" onClick={onRouteEnter}>
              Crear una cuenta
            </Link>
          ) : (
            <Link className="font-bold text-yellow-400" to="/login" onClick={onRouteEnter}>
              Ya tengo cuenta
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
