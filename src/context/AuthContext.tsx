import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { AuthContext } from './authContext';

/* ── Types (re-exported so consumers can import from one place) ────── */
export type { GoogleUser, NutriProfile, AuthContextValue } from './authContext';

/* ── Helpers ────────────────────────────────────────────────────────── */
import type { GoogleUser, NutriProfile } from './authContext';

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

const loadActive = (sub: string): NutriProfile | null => {
  try {
    const raw = localStorage.getItem(activeKey(sub));
    return raw ? (JSON.parse(raw) as NutriProfile) : null;
  } catch { return null; }
};

const saveActive = (sub: string, p: NutriProfile | null) => {
  if (p) localStorage.setItem(activeKey(sub), JSON.stringify(p));
  else   localStorage.removeItem(activeKey(sub));
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
  const [activeProfile, setActiveProfileState] = useState<NutriProfile | null>(() =>
    user ? loadActive(user.sub) : null
  );

  // Keep a ref in sync with user via effect (not during render)
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const login = useCallback((googleUser: GoogleUser) => {
    sessionStorage.setItem('nutriLensUser', JSON.stringify(googleUser));
    userRef.current = googleUser;
    setUser(googleUser);
    setProfiles(loadProfiles(googleUser.sub));
    setActiveProfileState(loadActive(googleUser.sub));
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('nutriLensUser');
    userRef.current = null;
    setUser(null);
    setProfiles([]);
    setActiveProfileState(null);
  }, []);

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
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProfiles(u.sub, next);
      return next;
    });
    setActiveProfileState((prev) => {
      if (prev?.id === id) {
        saveActive(u.sub, null);
        return null;
      }
      return prev;
    });
  }, []);

  const setActiveProfile = useCallback((p: NutriProfile) => {
    const u = userRef.current;
    if (u) saveActive(u.sub, p);
    setActiveProfileState(p);
  }, []);

  const clearActiveProfile = useCallback(() => {
    const u = userRef.current;
    if (u) saveActive(u.sub, null);
    setActiveProfileState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        profiles,
        activeProfile,
        addProfile,
        deleteProfile,
        setActiveProfile,
        clearActiveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
