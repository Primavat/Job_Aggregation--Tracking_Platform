import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: string; email: string } | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (token: string, user: { id: string; email: string }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      setAuth: (token, user) => {
        // ✅ Removed manual localStorage.setItem — persist handles this
        set({ token, user });
      },
      clearAuth: () => {
        // ✅ Removed manual localStorage.removeItem — persist handles this
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // ✅ Signals when localStorage has been read and store is ready
        state?.setHasHydrated(true);
      },
    }
  )
);