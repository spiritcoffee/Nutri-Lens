import { useContext } from 'react';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';

/* ── Hook ───────────────────────────────────────────────────────────── */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
