import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSession } from '../context/useAppSession';

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { profile, initializing } = useAppSession();

  if (initializing) {
    return (
      <main className="flex flex-1 items-center justify-center text-sm text-zinc-400">
        Cargando sesion...
      </main>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
