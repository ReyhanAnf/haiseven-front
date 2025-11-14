"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function GratitudePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ id: number; content: string; created_at: string }>>([]);

  // Persisted token fallback to avoid hydration redirect flicker
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
      try {
        const res = await fetch(`${API_BASE}/api/gratitude`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${effectiveToken}`,
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
  }, [token, persistedToken, router]);

  const handleSubmit = async () => {
    const effectiveToken = token || persistedToken;
    if (!effectiveToken || !content.trim()) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/gratitude`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${effectiveToken}`,
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

  if (!token) return null; // Avoid flash before redirect fallback resolves

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6">
        <h1 className="mb-2">Gratitude Jar</h1>
        <div className="deco-line mb-5" />
        <p className="text-sm mb-4 opacity-70">Tuliskan satu hal yang kamu syukuri hari ini. Fokus pada hal kecil yang membantu kamu bertumbuh.</p>
        <textarea
          className="input min-h-[140px] resize-vertical"
          placeholder="Aku bersyukur karena..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
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
