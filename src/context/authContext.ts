import { createContext } from 'react';

/* ── Types ─────────────────────────────────────────────────────────── */
export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export type NutriGoal = 'weight-loss' | 'muscle-gain' | 'maintenance' | 'general-health';
export type DietaryPref = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'high-protein';

export interface NutriProfile {
  id: string;
  avatar: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number;  // kg
  height: number;  // cm
  goal?: NutriGoal;
  dietaryPreferences?: DietaryPref[];
}

export interface MealHistoryEntry {
  id: string;
  timestamp: number;
  profileIds: string[]; // IDs of the profiles who ate the meal
  mealName: string;
  calories: number;
  ingredients: string[];
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
  updateProfile: (p: NutriProfile) => void;
  /** Toggle a profile in/out of the active selection */
  toggleActiveProfile: (p: NutriProfile) => void;
  /** Replace the entire active selection */
  setActiveProfiles: (profiles: NutriProfile[]) => void;
  /** Clear all active profiles (go back to selector) */
  clearActiveProfiles: () => void;
  /** Log of past generated and consumed meals */
  history: MealHistoryEntry[];
  /** Record a new meal into the user's history */
  addHistoryEntry: (entry: Omit<MealHistoryEntry, 'id' | 'timestamp'>) => void;
}

/* ── Context object (no components here — satisfies react-refresh) ── */
export const AuthContext = createContext<AuthContextValue | null>(null);
