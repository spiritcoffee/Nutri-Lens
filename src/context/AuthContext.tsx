import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { AuthContext } from './authContext';
import type { GoogleUser, NutriProfile } from './authContext';

/* ── Re-export types so consumers can import from one place ─────────── */
export type { GoogleUser, NutriProfile, AuthContextValue } from './authContext';

/* ── Storage helpers ─────────────────────────────────────────────────── */
const profilesKey = (sub: string) => `nutriLensProfiles:${sub}`;
const activeKey   = (sub: string) => `nutriLensActive:${sub}`;

const loadProfiles = (sub: string): NutriProfile[] => {
  try {
    const raw = localStorage.getItem(profilesKey(sub));
    return raw ? (JSON.parse(raw) as NutriProfile[]) : [];
  } catch { return []; }
};

const saveProfiles = (sub: string, list: NutriProfile[]) =>
  localStorage.setItem(profilesKey(sub), JSON.stringify(list));

const loadActiveProfiles = (sub: string): NutriProfile[] => {
  try {
    const raw = localStorage.getItem(activeKey(sub));
    return raw ? (JSON.parse(raw) as NutriProfile[]) : [];
  } catch { return []; }
};

const saveActiveProfiles = (sub: string, list: NutriProfile[]) => {
  if (list.length > 0)
    localStorage.setItem(activeKey(sub), JSON.stringify(list));
  else
    localStorage.removeItem(activeKey(sub));
};

/* ── Provider ───────────────────────────────────────────────────────── */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('nutriLensUser');
      return stored ? (JSON.parse(stored) as GoogleUser) : null;
    } catch { return null; }
  });

  const [profiles, setProfiles] = useState<NutriProfile[]>(() =>
    user ? loadProfiles(user.sub) : []
  );

  const [activeProfiles, setActiveProfilesState] = useState<NutriProfile[]>(() =>
    user ? loadActiveProfiles(user.sub) : []
  );

  // Ref so callbacks always read current user without stale closures
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  /* ── Auth ──────────────────────────────────────────────────────── */
  const login = useCallback((googleUser: GoogleUser) => {
    sessionStorage.setItem('nutriLensUser', JSON.stringify(googleUser));
    userRef.current = googleUser;
    setUser(googleUser);
    setProfiles(loadProfiles(googleUser.sub));
    setActiveProfilesState(loadActiveProfiles(googleUser.sub));
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('nutriLensUser');
    userRef.current = null;
    setUser(null);
    setProfiles([]);
    setActiveProfilesState([]);
  }, []);

  /* ── Profile CRUD ──────────────────────────────────────────────── */
  const addProfile = useCallback((p: NutriProfile) => {
    const u = userRef.current;
    if (!u) return;
    setProfiles((prev) => {
      const next = [...prev, p];
      saveProfiles(u.sub, next);
      return next;
    });
  }, []);

  const deleteProfile = useCallback((id: string) => {
    const u = userRef.current;
    if (!u) return;
    // Remove from profiles list
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProfiles(u.sub, next);
      return next;
    });
    // Also remove from active selection if it's there
    setActiveProfilesState((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveActiveProfiles(u.sub, next);
      return next;
    });
  }, []);

  /* ── Active profile selection ──────────────────────────────────── */
  const toggleActiveProfile = useCallback((p: NutriProfile) => {
    const u = userRef.current;
    if (!u) return;
    setActiveProfilesState((prev) => {
      const isSelected = prev.some((ap) => ap.id === p.id);
      const next = isSelected
        ? prev.filter((ap) => ap.id !== p.id)   // deselect
        : [...prev, p];                           // select
      saveActiveProfiles(u.sub, next);
      return next;
    });
  }, []);

  const setActiveProfiles = useCallback((list: NutriProfile[]) => {
    const u = userRef.current;
    if (u) saveActiveProfiles(u.sub, list);
    setActiveProfilesState(list);
  }, []);

  const clearActiveProfiles = useCallback(() => {
    const u = userRef.current;
    if (u) saveActiveProfiles(u.sub, []);
    setActiveProfilesState([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        profiles,
        activeProfiles,
        addProfile,
        deleteProfile,
        toggleActiveProfile,
        setActiveProfiles,
        clearActiveProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
