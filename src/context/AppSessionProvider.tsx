import type { ReactNode } from 'react';
import { AppSessionContext } from './appSessionContext';
import { useRoomsSession } from '../hooks/useRoomsSession';

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const session = useRoomsSession();

  return <AppSessionContext.Provider value={session}>{children}</AppSessionContext.Provider>;
}
