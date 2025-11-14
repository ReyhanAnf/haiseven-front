"use client";
import { useEffect, useRef, useState } from "react";

// Mental Unload (Teks Fana) – purely frontend ephemeral tool
// User writes negative thoughts, burns them visually; data never sent or stored.

const TOTAL_SECONDS = 300; // 5 minutes

export default function MentalUnloadPage() {
  const [text, setText] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isBurning, setIsBurning] = useState(false);
  const [justCleared, setJustCleared] = useState(false);
  const burnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleContainerRef = useRef<HTMLDivElement | null>(null);

  // Countdown logic
  useEffect(() => {
    if (isBurning) return; // pause countdown while burning
    if (secondsLeft <= 0) {
      if (!isBurning && text.trim().length) triggerBurn();
      return;
    }
    const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, isBurning, text]);

  // Trigger burn effect
  const triggerBurn = () => {
    if (isBurning) return;
    if (!text.trim().length) return; // nothing to burn
    setIsBurning(true);
    setJustCleared(false);
    spawnParticles();
    burnTimeoutRef.current = setTimeout(() => {
      setText("");
      setIsBurning(false);
      setSecondsLeft(TOTAL_SECONDS); // reset timer automatically after burn
      setJustCleared(true);
      // Fade out the cleared message after a short delay
      setTimeout(() => setJustCleared(false), 2500);
    }, 2000); // matches CSS animation duration
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (burnTimeoutRef.current) clearTimeout(burnTimeoutRef.current);
  }, []);

  // Particle / ember spawning
  const spawnParticles = () => {
    const container = particleContainerRef.current;
    if (!container) return;
    container.innerHTML = "";
    const PARTICLE_COUNT = 42;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement("span");
      p.className = "ember";
      const x = Math.random() * 100;
      const delay = (Math.random() * 1.2).toFixed(2);
      const size = (Math.random() * 6 + 4).toFixed(2);
      p.style.left = x + "%";
      p.style.animationDelay = delay + "s";
      p.style.width = size + "px";
      p.style.height = size + "px";
      container.appendChild(p);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6 sm:p-8 relative overflow-hidden">
        <h1 className="mb-2 fancy-title">Mental Unload</h1>
        <div className="deco-line mb-5" />
        <p className="text-sm opacity-70 mb-4">Tulis semua pikiran negatifmu di sini. Tidak akan pernah disimpan. Saat waktu habis atau kamu bakar manual, semuanya lenyap.</p>

        <div className="flex items-center justify-between mb-4 gap-3 text-sm font-mono tracking-wide">
          <span className="timer-chip" aria-live="polite">⏳ {formatted}</span>
          <button
            className="btn btn-danger burn-btn"
            onClick={triggerBurn}
            disabled={isBurning || !text.trim().length}
          >
            {isBurning ? "Membakar..." : "Bakar Pikiran Ini"}
          </button>
        </div>

        <div className={`relative textarea-wrapper ${isBurning ? "burning" : ""}`}>
          <textarea
            className="unload-textarea"
            placeholder="Curahkan semuanya di sini..."
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={isBurning}
          />
          {/* Particle layer */}
          <div ref={particleContainerRef} className={`particle-layer pointer-events-none ${isBurning ? "active" : ""}`} />
          {justCleared && !text && (
            <div className="cleared-msg">Pikiranmu telah hilang ✨</div>
          )}
        </div>

        <style jsx>{`
          .fancy-title {
            font-size: clamp(1.9rem, 4vw, 2.4rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            background: linear-gradient(120deg, #ff8a3d, #ff4d6d 35%, #a854ff 65%, #2dd4bf);
            -webkit-background-clip: text;
            color: transparent;
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));
          }
          .timer-chip {
            background: linear-gradient(90deg,#1e293b,#334155);
            color: #f8fafc;
            padding: 6px 12px;
            border-radius: 999px;
            box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px -2px rgba(0,0,0,0.35);
            backdrop-filter: blur(6px);
          }
          .burn-btn {
            position: relative;
            overflow: hidden;
          }
          .burn-btn:disabled { opacity: .55; cursor: not-allowed; }
          .unload-textarea {
            width: 100%;
            min-height: 240px;
            resize: vertical;
            background: linear-gradient(145deg,#0f172a,#1e293b 60%);
            color: #f1f5f9;
            font-size: 1.05rem;
            line-height: 1.55;
            padding: 1.1rem 1rem;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 1rem;
            outline: none;
            transition: box-shadow .4s, border-color .4s, filter .4s, opacity .4s;
            box-shadow: 0 4px 18px -4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.04);
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }
          .unload-textarea:focus {
            border-color: #ff6b4a;
            box-shadow: 0 0 0 3px rgba(255,107,74,0.25), 0 4px 20px -3px rgba(255,107,74,0.3);
          }
          .textarea-wrapper.burning .unload-textarea {
            animation: burnFade 2s forwards;
          }
          @keyframes burnFade {
            0% { filter: none; opacity:1; }
            25% { filter: blur(2px) brightness(1.1); }
            50% { filter: blur(6px) brightness(0.9) contrast(1.2); }
            75% { filter: blur(14px) brightness(0.6) contrast(1.4); }
            100% { filter: blur(22px) brightness(0.4) contrast(1.6); opacity:0; }
          }
          .particle-layer {
            position: absolute;
            inset: 0;
            opacity:0;
            transition: opacity .4s;
          }
          .particle-layer.active { opacity:1; }
          .ember {
            position: absolute;
            bottom: 0;
            background: radial-gradient(circle at 30% 30%, #ffdda8, #ff8a3d 60%, rgba(255,77,109,0.4));
            border-radius: 50%;
            pointer-events: none;
            animation: rise 1.8s ease-in forwards, flicker 0.9s linear infinite;
            mix-blend-mode: screen;
          }
          @keyframes rise {
            0% { transform: translateY(0) scale(1); opacity:0; }
            10% { opacity:.9; }
            70% { opacity:.7; }
            100% { transform: translateY(-180px) scale(0); opacity:0; }
          }
          @keyframes flicker {
            0%,100% { filter: brightness(1); }
            50% { filter: brightness(1.8); }
          }
          .cleared-msg {
            position: absolute;
            inset: 0;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:600;
            font-size:1.1rem;
            letter-spacing:.5px;
            color:#f8fafc;
            backdrop-filter: blur(12px) saturate(130%);
            background: linear-gradient(115deg, rgba(255,77,109,0.25), rgba(168,84,255,0.25), rgba(45,212,191,0.25));
            border:1px solid rgba(255,255,255,0.12);
            border-radius:1rem;
            animation: clearedFade .55s ease-out;
          }
          @keyframes clearedFade {
            0% { opacity:0; transform: scale(.94); }
            60% { opacity:1; transform: scale(1.02); }
            100% { opacity:1; transform: scale(1); }
          }
          .card { animation: mountFade .5s ease; }
          @keyframes mountFade { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0);} }
        `}</style>
      </div>
    </div>
  );
}
