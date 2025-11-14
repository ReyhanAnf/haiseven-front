"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FocusItem = { id?: number; content: string; completed?: boolean; order?: number };
type TodayResponse = { date: string; items: FocusItem[] } | null;

export default function FocusPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<FocusItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [history, setHistory] = useState<Array<{ id: number; date: string; items_count: number }>>([]);
  const [viewDate, setViewDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read persisted token (Zustand persist) to avoid pre-hydration redirects
  const persistedToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("haiseven-auth");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.token ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const effectiveToken = token || persistedToken;
    if (!effectiveToken) {
      router.replace("/login");
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/focus/today`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${effectiveToken}`,
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
            Authorization: `Bearer ${effectiveToken}`,
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
  }, [token, persistedToken, router]);

  const onSave = async () => {
    const effectiveToken = token || persistedToken;
    if (!effectiveToken) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/focus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${effectiveToken}`,
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

  if (!token) return null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-5 sm:p-6">
        <h1 className="mb-2">Daily Focus</h1>
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
            <li key={idx} className="relative group border border-[var(--border)] rounded-xl p-4 transition-colors bg-white/70">
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
          ))}
        </ul>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
        <button onClick={onSave} className="btn btn-primary w-full mt-5" disabled={loading}>
          {loading ? "Menyimpan…" : "Simpan Fokus Hari Ini"}
        </button>
      </div>

      {/* History */}
      <div className="mt-6 card p-4">
        <div className="flex items-center justify-between">
          <h2>Riwayat</h2>
          {viewDate && (
            <button className="btn btn-ghost" onClick={() => setViewDate(null)}>Kembali ke Hari Ini</button>
          )}
        </div>
        <div className="deco-line my-3" />
        <ul className="divide-y divide-[var(--border)]">
          {history.map((d) => (
            <li key={d.id} className="py-2 flex items-center justify-between">
              <button
                className="text-sm underline decoration-dotted"
                onClick={async () => {
                  setViewDate(d.date);
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch(`${API_BASE}/api/focus/today`, {
                      method: "GET",
                      headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token || persistedToken}`,
                      },
                      cache: "no-store",
                    });
                    // Note: Ideally, we'd have an endpoint GET /api/focus?date=YYYY-MM-DD
                    // For now, we only list dates as history info.
                  } finally {
                    setLoading(false);
                  }
                }}
              >{new Date(d.date).toLocaleDateString()}</button>
              <span className="text-xs opacity-70">{d.items_count} fokus</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
