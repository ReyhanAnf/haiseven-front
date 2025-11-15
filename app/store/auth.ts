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
  isLoginModalOpen: boolean;
  loginModalMessage: string | null;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  showLoginModal: (message?: string) => void;
  hideLoginModal: () => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isLoginModalOpen: false,
      loginModalMessage: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      showLoginModal: (message) => set({ isLoginModalOpen: true, loginModalMessage: message || null }),
      hideLoginModal: () => set({ isLoginModalOpen: false, loginModalMessage: null }),
      reset: () => set({ user: null, token: null, isLoading: false, isLoginModalOpen: false, loginModalMessage: null }),
    }),
    {
      name: "haiseven-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
