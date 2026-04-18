import { createContext } from 'react';

/* ── Types ─────────────────────────────────────────────────────────── */
export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export interface NutriProfile {
  id: string;
  avatar: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number;  // kg
  height: number;  // cm
}

export interface AuthContextValue {
  user: GoogleUser | null;
  login: (user: GoogleUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  profiles: NutriProfile[];
  activeProfile: NutriProfile | null;
  addProfile: (p: NutriProfile) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (p: NutriProfile) => void;
  clearActiveProfile: () => void;
}

/* ── Context object (no components here — satisfies react-refresh) ── */
export const AuthContext = createContext<AuthContextValue | null>(null);
