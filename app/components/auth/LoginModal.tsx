"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useAuthStore } from "@/app/store/auth";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LogIn, Mail, Sparkles, User, UserPlus, X } from "lucide-react";
import { useState } from "react";

export default function LoginModal() {
  const { isLoginModalOpen, loginModalMessage, hideLoginModal } = useAuthStore();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // Success - modal will auto-close and page will refresh with user data
      hideLoginModal();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    hideLoginModal();
    resetForm();
    setMode("login");
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  if (!isLoginModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {mode === "login" ? "Masuk" : "Daftar"}
              </h2>
            </div>

            {loginModalMessage && (
              <p className="text-white/90 text-sm mt-2">
                {loginModalMessage}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="input w-full"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input w-full"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full"
                required
                minLength={8}
                disabled={loading}
              />
              {mode === "register" && (
                <p className="text-xs text-slate-500 mt-1">Minimal 8 karakter</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] opacity-50 group-hover:opacity-75 transition-opacity" />
              {mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{loading ? "Masuk..." : "Masuk"}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{loading ? "Mendaftar..." : "Daftar Sekarang"}</span>
                </>
              )}
            </button>

            {/* Switch Mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={switchMode}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                disabled={loading}
              >
                {mode === "login" ? (
                  <>Belum punya akun? <span className="text-blue-600">Daftar</span></>
                ) : (
                  <>Sudah punya akun? <span className="text-blue-600">Masuk</span></>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="px-6 pb-6">
            <p className="text-xs text-slate-500 text-center">
              Dengan {mode === "login" ? "masuk" : "mendaftar"}, Anda setuju dengan syarat & ketentuan kami
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
