import { createContext } from 'react';
import { useRoomsSession } from '../hooks/useRoomsSession';

export type AppSessionValue = ReturnType<typeof useRoomsSession>;

export const AppSessionContext = createContext<AppSessionValue | null>(null);
