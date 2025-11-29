import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LinuxDoUser {
  id: number;
  username: string;
  name: string;
  avatar_template: string;
  active: boolean;
  trust_level: number;
  silenced: boolean;
  external_ids?: Record<string, unknown>;
  api_key?: string;
}

interface AuthStore {
  user: LinuxDoUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: LinuxDoUser, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'kvideo-auth-storage',
    }
  )
);
