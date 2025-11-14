"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOTAL_SECONDS = 180; // 3 minutes
const IDLE_BLUR_MS = 5000; // 5 seconds

export default function MorningPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blurred, setBlurred] = useState(false);
  const lastTypeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const persistedToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("haiseven-auth");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.token ?? null;
    } catch { return null; }
  }, []);

  const effectiveToken = token || persistedToken;

  useEffect(() => {
    if (!effectiveToken) {
      const id = setTimeout(() => router.replace("/login"), 150);
      return () => clearTimeout(id);
    }
  }, [effectiveToken, router]);

  // Countdown timer
  useEffect(() => {
    if (!effectiveToken || saved) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [effectiveToken, saved]);

  // Auto-save when timer finishes
  useEffect(() => {
    if (secondsLeft === 0 && !saved) {
      handleSave();
    }
  }, [secondsLeft, saved]);

  // Blur logic based on idle time
  const scheduleBlur = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setBlurred(false); // show clear while typing
    blurTimeoutRef.current = setTimeout(() => {
      setBlurred(true); // after idle
    }, IDLE_BLUR_MS);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    lastTypeRef.current = Date.now();
    scheduleBlur();
  };

  const handleSave = async () => {
    if (!effectiveToken || saving || saved) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/morning-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${effectiveToken}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan morning page.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  // Warn user on unload if not saved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!saved && content.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saved, content]);

  if (!effectiveToken) {
    return <div className="mx-auto max-w-lg"><div className="card p-6"><p className="text-sm">Memeriksa sesi...</p></div></div>;
  }

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="min-h-[70vh] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1>Morning Page</h1>
        <div className="text-sm font-mono px-3 py-1 rounded border border-[var(--border)] bg-white/70">
          {minutes}:{secs.toString().padStart(2, "0")}
        </div>
      </div>
      <div className="deco-line" />
      <div className="relative flex-1">
        <textarea
          className={`w-full h-full outline-none p-4 rounded-xl border border-[var(--border)] bg-white resize-none text-base leading-relaxed tracking-wide transition-all ${blurred ? 'blur-[5px]' : ''}`}
          placeholder="Brain dump mulai sekarang... jangan edit, hanya tulis apa pun yang muncul."
          value={content}
          onChange={handleChange}
          disabled={saved}
        />
        {saved && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
            <p className="text-lg font-semibold">Morning Page tersimpan. ✅</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!saved && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex-1"
          >{saving ? 'Menyimpan...' : 'Selesai & Simpan'}</button>
          <button
            onClick={() => { setContent(""); scheduleBlur(); }}
            type="button"
            className="btn btn-ghost"
          >Kosongkan</button>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary" onClick={() => { setSaved(false); setSecondsLeft(TOTAL_SECONDS); setContent(""); scheduleBlur(); }}>Mulai Lagi</button>
        </div>
      )}
      <p className="text-xs opacity-60">Teks akan blur setelah {IDLE_BLUR_MS/1000} detik tanpa mengetik untuk mencegah editing.</p>
    </div>
  );
}
