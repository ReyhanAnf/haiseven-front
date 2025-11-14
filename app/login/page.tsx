"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="mb-2">Login</h1>
        <div className="h-1 w-16 bg-[var(--bau-blue)] mb-6" />
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          {error && <p className="text-[var(--bau-red)] text-sm">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
