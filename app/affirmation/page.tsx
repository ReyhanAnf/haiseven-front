"use client";

import { useMemo, useState } from "react";
import { TextGenerateEffect } from "../components/ui/text-generate-effect";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const GRID_COUNT = 8; // jumlah card dalam grid

type Card = { id: number; text: string; tone: string };

export default function AffirmationPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const tones = useMemo(
    () => [
      "gradient-blue", "gradient-purple", "gradient-warm",
      "gradient-sunset", "gradient-ocean", "gradient-citrus",
    ],
    []
  );

  const getOne = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/affirmation/random`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return (data?.text as string) ?? "Hari ini aku memilih hal baik dan bergerak maju.";
  };

  const shuffle = async () => {
    setLoading(true);
    try {
      const tries = Array.from({ length: GRID_COUNT }, () => getOne());
      const results = await Promise.allSettled(tries);
      const texts: string[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") {
          const t = r.value.trim();
          if (!texts.includes(t)) texts.push(t);
        }
      }
      // fallback minimal 1 item
      if (texts.length === 0) {
        texts.push("Tetap tenang, tarik napas, dan mulai pelan-pelan.");
      }
      const next: Card[] = texts.map((t, i) => ({
        id: i + 1,
        text: t,
        tone: tones[i % tones.length],
      }));
      setCards(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="mb-2">Positive Fortune Cookie</h1>
          <button onClick={shuffle} className="btn btn-primary min-w-[200px]" disabled={loading}>
            {loading ? "Memuat…" : (cards.length ? "Shuffle Afirmasi" : "Lihat Afirmasi Hari Ini")}
          </button>
        </div>
        <div className="deco-line my-5" />

        {cards.length === 0 ? (
          <p className="text-sm opacity-70">Klik tombol di atas untuk menampilkan affirmations dalam grid kartu berwarna.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {cards.map((c) => (
              <li key={c.id} className={`card gradient-card gradient-animated ${c.tone} p-5 sm:p-6 transition-transform hover:scale-[1.01]`}
                  style={{ willChange: 'transform' }}>
                <TextGenerateEffect
                  words={c.text}
                  className="text-base sm:text-lg leading-relaxed text-white"
                  duration={0.3}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
