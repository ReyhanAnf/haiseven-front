"use client";

import { useAuthStore } from "@/app/store/auth";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type State = "idle" | "playing" | "done";

type Question = {
  a: number;
  b: number;
  op: "+" | "-" | "×" | "÷";
};

function generateQuestion(includeAdvanced: boolean): Question {
  const ops: Question["op"][] = includeAdvanced ? ["+", "-", "×", "÷"] : ["+", "-"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 20) + 1;
  if (op === "-") {
    if (b > a) [a, b] = [b, a];
  } else if (op === "×") {
    // keep numbers small-ish
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
  } else if (op === "÷") {
    // ensure integer result: build dividend as product
    b = Math.floor(Math.random() * 12) + 1;
    const k = Math.floor(Math.random() * 12) + 1;
    a = b * k; // a divisible by b
  }
  return { a, b, op };
}

export default function BrainWarmupPage() {
  const { token } = useAuth();
  const { user, showLoginModal } = useAuthStore();
  const [state, setState] = useState<State>("idle");
  const [timeLeft, setTimeLeft] = useState(60);
  const [includeAdvanced, setIncludeAdvanced] = useState(true);
  const [q, setQ] = useState<Question>(generateQuestion(true));
  const [choices, setChoices] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  // No route protection - anyone can play the game

  // timer effect
  useEffect(() => {
    if (state !== "playing") return;
    if (timeLeft <= 0) {
      setState("done");
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [state, timeLeft]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    const nq = generateQuestion(includeAdvanced);
    setQ(nq);
    buildChoices(generateAnswer(nq));
    setTimeLeft(60);
    setState("playing");
    setMessage(null);
  };

  function generateAnswer(qq: Question): number {
    switch (qq.op) {
      case "+": return qq.a + qq.b;
      case "-": return qq.a - qq.b;
      case "×": return qq.a * qq.b;
      case "÷": return Math.floor(qq.a / qq.b); // guaranteed integer
    }
  }

  function buildChoices(correct: number) {
    const set = new Set<number>();
    set.add(correct);
    while (set.size < 4) {
      const delta = Math.floor(Math.random() * 9) - 4; // -4..+4
      const candidate = Math.max(0, correct + (delta === 0 ? 1 : delta));
      set.add(candidate);
    }
    const arr = Array.from(set);
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setChoices(arr);
  }

  function playSound(type: "click" | "ok" | "no") {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      if (type === "ok") o.frequency.value = 660; else if (type === "no") o.frequency.value = 180; else o.frequency.value = 440;
      o.type = type === "no" ? "square" : "sine";
      g.gain.value = 0.08;
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, type === "ok" ? 120 : 100);
    } catch {}
  }

  const onChoose = (val: number) => {
    if (state !== "playing") return;
    playSound("click");
    const correct = generateAnswer(q);
    if (val === correct) {
      playSound("ok");
      setScore((s) => s + 1);
      setStreak((st) => {
        const ns = st + 1;
        if (ns % 5 === 0) {
          setScore((s) => s + 3);
          setShowBonus(true);
          setTimeout(() => setShowBonus(false), 600);
        }
        return ns;
      });
      const nq = generateQuestion(includeAdvanced);
      setQ(nq);
      buildChoices(generateAnswer(nq));
    } else {
      playSound("no");
      setStreak(0);
    }
  };

  const saveScore = async () => {
    // Login-to-save pattern
    if (!user || !token) {
      showLoginModal("Login untuk menyimpan skor Brain Warmup Anda!");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/brain-warmup/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, game_type: "Math" }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan skor.");
      setMessage("Skor tersimpan! ✨");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  // No guard clause - anyone can play

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1>Brain Warm-up</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" className="accent-blue-500" checked={includeAdvanced} onChange={(e) => setIncludeAdvanced(e.target.checked)} />
              Sertakan × ÷
            </label>
            <button className="btn btn-primary" onClick={startGame}>{state !== 'playing' ? 'Mulai Game (60 detik)' : 'Mulai Ulang'}</button>
            <button className="btn btn-ghost" onClick={() => setMuted((m) => !m)}>{muted ? '🔇' : '🔊'}</button>
          </div>
        </div>
        <div className="deco-line my-5" />

        {state === "idle" && (
          <div className="text-sm opacity-70">
            Main matematika cepat selama 60 detik. Jawab benar untuk menambah skor.
          </div>
        )}

        {state === "playing" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2 relative overflow-hidden rounded-xl border border-[var(--border)]">
              <div className="absolute inset-0 gradient-animated gradient-ocean opacity-60" />
              <div className="relative p-6 sm:p-8">
                <div className="text-sm font-mono mb-2">Waktu: <span className="font-bold">{timeLeft}s</span></div>
                <div className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-wide">
                  {q.a} {q.op} {q.b} = ?
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {choices.map((c) => (
                    <button key={c} className="btn btn-secondary text-xl" onClick={() => onChoose(c)}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card gradient-card gradient-animated gradient-sunset p-5 text-white">
              <div className="text-sm opacity-90">Skor Saat Ini</div>
              <div className="text-5xl font-extrabold">{score}</div>
              <div className="text-sm mt-2">Streak: {streak}</div>
              {showBonus && <div className="mt-2 text-xs bg-white/20 rounded px-2 py-1 inline-block">Combo +3!</div>}
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="text-center">
            <h2>Waktu Habis!</h2>
            <p className="text-5xl font-extrabold mt-2">Skor: {score}</p>
            {message && <p className="mt-3 text-sm">{message}</p>}
            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              <button className="btn btn-primary" disabled={saving} onClick={saveScore}>{saving ? 'Menyimpan…' : 'Simpan Skor'}</button>
              <button className="btn btn-ghost" onClick={startGame}>Main Lagi</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
