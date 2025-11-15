"use client";

import { Lock, Mail, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DotBackground } from "../components/ui/grid-background";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    }
  };

  return (
    <DotBackground className="min-h-screen flex items-center justify-center p-4">
      <div className="mx-auto max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join HaiSeven</h1>
          <p className="text-slate-600">Mulai perjalanan mindfulness kamu</p>
        </div>

        <div className="card p-8 shadow-xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nama
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="nama@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              className="btn btn-secondary w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </DotBackground>
  );
}
