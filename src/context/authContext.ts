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
  /** All saved nutrition profiles for this Google account */
  profiles: NutriProfile[];
  /** Profiles currently selected for this session (can be multiple) */
  activeProfiles: NutriProfile[];
  addProfile: (p: NutriProfile) => void;
  deleteProfile: (id: string) => void;
  /** Toggle a profile in/out of the active selection */
  toggleActiveProfile: (p: NutriProfile) => void;
  /** Replace the entire active selection */
  setActiveProfiles: (profiles: NutriProfile[]) => void;
  /** Clear all active profiles (go back to selector) */
  clearActiveProfiles: () => void;
}

/* ── Context object (no components here — satisfies react-refresh) ── */
export const AuthContext = createContext<AuthContextValue | null>(null);
