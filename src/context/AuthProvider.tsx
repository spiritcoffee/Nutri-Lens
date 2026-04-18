import { useState, useCallback, type ReactNode } from 'react';
import {
  AuthContext,
  type GoogleUser,
  type NutriProfile,
  type MealHistoryEntry,
} from './authContext';

/* ── localStorage keys ─────────────────────────────────────────────── */
const LS_USER      = 'nutri-lens-user';
const LS_PROFILES  = 'nutri-lens-profiles';
const LS_ACTIVE    = 'nutri-lens-active';
const LS_HISTORY   = 'nutri-lens-history';

/* ── Helpers ───────────────────────────────────────────────────────── */
const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

/* ── Provider Component ────────────────────────────────────────────── */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]                   = useState<GoogleUser | null>(() => load<GoogleUser | null>(LS_USER, null));
  const [profiles, setProfiles]           = useState<NutriProfile[]>(() => load<NutriProfile[]>(LS_PROFILES, []));
  const [activeProfiles, setActiveState]  = useState<NutriProfile[]>(() => load<NutriProfile[]>(LS_ACTIVE, []));
  const [history, setHistory]             = useState<MealHistoryEntry[]>(() => load<MealHistoryEntry[]>(LS_HISTORY, []));

  /* ── Auth ──────────────────────────────────────────────────────── */
  const login = useCallback((u: GoogleUser) => {
    setUser(u);
    localStorage.setItem(LS_USER, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setActiveState([]);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_ACTIVE);
  }, []);

  /* ── Profiles ──────────────────────────────────────────────────── */
  const addProfile = useCallback((p: NutriProfile) => {
    setProfiles(prev => {
      const next = [...prev, p];
      localStorage.setItem(LS_PROFILES, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(LS_PROFILES, JSON.stringify(next));
      return next;
    });
    setActiveState(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(LS_ACTIVE, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProfile = useCallback((updated: NutriProfile) => {
    setProfiles(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      localStorage.setItem(LS_PROFILES, JSON.stringify(next));
      return next;
    });
    setActiveState(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      localStorage.setItem(LS_ACTIVE, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleActiveProfile = useCallback((p: NutriProfile) => {
    setActiveState(prev => {
      const exists = prev.some(a => a.id === p.id);
      const next = exists ? prev.filter(a => a.id !== p.id) : [...prev, p];
      localStorage.setItem(LS_ACTIVE, JSON.stringify(next));
      return next;
    });
  }, []);

  const setActiveProfiles = useCallback((profiles: NutriProfile[]) => {
    setActiveState(profiles);
    localStorage.setItem(LS_ACTIVE, JSON.stringify(profiles));
  }, []);

  const clearActiveProfiles = useCallback(() => {
    setActiveState([]);
    localStorage.removeItem(LS_ACTIVE);
  }, []);

  /* ── History ───────────────────────────────────────────────────── */
  const addHistoryEntry = useCallback(
    (entry: Omit<MealHistoryEntry, 'id' | 'timestamp'>) => {
      const full: MealHistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setHistory(prev => {
        const next = [full, ...prev];
        localStorage.setItem(LS_HISTORY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        profiles,
        activeProfiles,
        addProfile,
        deleteProfile,
        updateProfile,
        toggleActiveProfile,
        setActiveProfiles,
        clearActiveProfiles,
        history,
        addHistoryEntry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
