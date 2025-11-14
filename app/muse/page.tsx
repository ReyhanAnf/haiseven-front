"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function MusePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchPrompt = async () => {
    setLoading(true);
    setVisible(false);
    try {
      const res = await fetch(`${API_BASE}/api/muse/random`, { headers: { Accept: "application/json" }, cache: "no-store" });
      const data = await res.json();
      setPrompt(data.prompt_text || "Tuliskan sesuatu yang membuatmu tersenyum pagi ini.");
      requestAnimationFrame(() => setVisible(true));
    } catch {
      setPrompt("Ide backup: bayangkan jendela berbicara pada awan.");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8">
        <h1 className="mb-2">Morning Muse</h1>
        <div className="deco-line mb-6" />
        <button
          onClick={fetchPrompt}
          className="btn btn-secondary w-full"
          disabled={loading}
        >
          {loading ? "Memetik ide..." : (prompt ? "Ide Lagi" : "Beri Saya Ide")}
        </button>
        {prompt && (
          <p className={`mt-6 text-lg leading-relaxed transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {prompt}
          </p>
        )}
      </div>
    </div>
  );
}
