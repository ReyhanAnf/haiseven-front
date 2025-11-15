"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CardSpotlight } from "../components/ui/card-spotlight";
import { SparklesCore } from "../components/ui/sparkles";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FocusItem = { id?: number; content: string; completed?: boolean; order?: number };
type TodayResponse = { date: string; items: FocusItem[] } | null;

export default function FocusPage() {
  const { token } = useAuth();
  const { user, showLoginModal } = useAuthStore();
  const [items, setItems] = useState<FocusItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [history, setHistory] = useState<Array<{ id: number; date: string; items_count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user's saved data if logged in
  useEffect(() => {
    if (!user || !token) return; // Only load if user is logged in

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/focus/today`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Gagal memuat data fokus.");
        const data = (await res.json()) as TodayResponse;
        if (data?.items) setItems(data.items);

        // load history (lightweight)
        const hres = await fetch(`${API_BASE}/api/focus/history?limit=10`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (hres.ok) {
          const hdata = (await hres.json()) as Array<{ id: number; date: string; items_count: number }>;
          setHistory(hdata);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, token]);

  const onSave = async () => {
    // 🔑 LOGIN TO SAVE PATTERN
    if (!user || !token) {
      showLoginModal("Login untuk menyimpan Daily Focus Anda dan lacak progress Anda!");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/focus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: items.map((it, i) => ({ content: it.content, completed: !!it.completed, order: i })) }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan fokus.");
      setMessage("Fokus hari ini tersimpan.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!newContent.trim()) return;
    setItems((prev) => [...prev, { content: newContent.trim(), completed: false }]);
    setNewContent("");
  };

  const toggleCompleted = (idx: number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, completed: !it.completed } : it)));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <h1>Daily Focus</h1>
          <Link href="/focus/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Lihat Riwayat →
          </Link>
        </div>
        <div className="deco-line mb-5" />

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Tambahkan fokus baru…"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
          />
          <button className="btn btn-secondary" onClick={addItem}>Tambah</button>
        </div>

        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((it, idx) => (
            <CardSpotlight key={idx} radius={180} color={it.completed ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)"}>
              <li className="relative group border border-[var(--border)] rounded-xl p-4 transition-colors bg-white/80">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleCompleted(idx)}
                    className={`h-5 w-5 rounded border ${it.completed ? 'bg-gradient-to-r from-[var(--grad-blue-start)] to-[var(--grad-blue-end)] border-transparent' : 'border-[var(--border)] bg-white'}`}
                    aria-label="Toggle"
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${it.completed ? 'line-through opacity-60' : ''}`}>{it.content}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    className="text-xs px-2 py-1 rounded border border-[var(--border)] bg-white mr-1"
                    onClick={() => removeItem(idx)}
                  >Hapus</button>
                </div>
              </li>
            </CardSpotlight>
          ))}
        </ul>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={50}
                  particleColor="#3b82f6"
                  className="w-full h-full"
                />
              </div>
              <p className="text-blue-700 text-sm font-medium relative z-10">✨ {message}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={onSave} className="btn btn-primary w-full mt-5" disabled={loading}>
          {loading ? "Menyimpan…" : "Simpan Fokus Hari Ini"}
        </button>
      </div>

      {/* History - Only show if logged in */}
      {user && history.length > 0 && (
        <div className="mt-6 card p-4">
          <div className="flex items-center justify-between">
            <h2>Riwayat Terakhir</h2>
          </div>
          <div className="deco-line my-3" />
          <ul className="divide-y divide-[var(--border)]">
            {history.slice(0, 5).map((d) => (
              <li key={d.id} className="py-2 flex items-center justify-between">
                <span className="text-sm">{new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="text-xs opacity-70">{d.items_count} fokus</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
