"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ user: null, token: null, isLoading: false }),
    }),
    {
      name: "haiseven-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
