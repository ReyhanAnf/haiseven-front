"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuthStore, type AuthUser } from "../store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiResponse = {
  token?: string;
  token_type?: string;
  user?: AuthUser;
  [key: string]: unknown;
};

async function apiFetch(path: string, options: RequestInit = {}, token?: string): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const body = await res.json();
      msg = body.message || JSON.stringify(body);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export function useAuth() {
  const { user, token, isLoading, setUser, setToken, setLoading, reset } = useAuthStore();
  const router = useRouter();

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const data = await apiFetch("/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        if (data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
          router.push("/dashboard");
        }
        return data;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setToken, setUser, router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const data = await apiFetch("/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
          router.push("/dashboard");
        }
        return data;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setToken, setUser, router]
  );

  const logout = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      await apiFetch("/logout", { method: "POST" }, token);
      reset();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, reset, router]);

  const getUser = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const data = await apiFetch("/user", { method: "GET" }, token);
      if (data && typeof data === "object" && "id" in data) {
        // When controller returns raw user object
        setUser(data as unknown as AuthUser);
        return data as unknown as AuthUser;
      }
      if (data.user) {
        setUser(data.user);
        return data.user;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, setUser]);

  return {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    getUser,
  };
}
