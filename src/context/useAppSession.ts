import { useContext } from 'react';
import { AppSessionContext } from './appSessionContext';

export function useAppSession() {
  const session = useContext(AppSessionContext);

  if (!session) {
    throw new Error('useAppSession debe usarse dentro de AppSessionProvider.');
  }

  return session;
}
