"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SparklesCore } from "../components/ui/sparkles";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function GratitudePage() {
  const { token } = useAuth();
  const { user, showLoginModal } = useAuthStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ id: number; content: string; created_at: string }>>([]);

  // Load user's saved gratitude entries if logged in
  useEffect(() => {
    if (!user || !token) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/gratitude`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch {
        // silent for now
      }
    };
    load();
  }, [user, token]);

  const handleSubmit = async () => {
    // 🔑 LOGIN TO SAVE PATTERN
    if (!user || !token) {
      showLoginModal("Login untuk menyimpan momen syukur Anda ke Toples Syukur!");
      return;
    }

    if (!content.trim()) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/gratitude`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan entri syukur.");
      const json = await res.json();
      setMessage("Tersimpan ke Toples Syukur.");
      setContent("");
      setEntries((prev) => [json.entry, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <h1>Gratitude Jar</h1>
          {user && (
            <Link href="/gratitude/history" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
              Lihat Journal →
            </Link>
          )}
        </div>
        <div className="deco-line mb-5" />
        <p className="text-sm mb-4 opacity-70">Tuliskan satu hal yang kamu syukuri hari ini. Fokus pada hal kecil yang membantu kamu bertumbuh.</p>
        <textarea
          className="input min-h-[140px] resize-vertical"
          placeholder="Aku bersyukur karena..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-4 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={50}
                  particleColor="#ec4899"
                  className="w-full h-full"
                />
              </div>
              <p className="text-pink-700 text-sm font-medium relative z-10">✨ {message}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="btn btn-primary w-full mt-4"
        >
          {loading ? "Menyimpan..." : "Simpan ke Toples Syukur"}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="mt-6 card p-5">
          <h2 className="mb-2">Catatan Sebelumnya</h2>
          <div className="deco-line mb-4" />
          <ul className="space-y-3">
            {entries.map((e) => (
              <li key={e.id} className="border border-[var(--border)] rounded-xl p-4 bg-white/70">
                <p className="text-sm leading-relaxed">{e.content}</p>
                <p className="text-[10px] mt-2 opacity-60">{new Date(e.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
