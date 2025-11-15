"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { TextGenerateEffect } from "../components/ui/text-generate-effect";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function MusePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(0); // Force re-render animation

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/muse/random`, {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      const data = await res.json();
      setPrompt(data.prompt_text || "Tuliskan sesuatu yang membuatmu tersenyum pagi ini.");
      setKey(prev => prev + 1); // Trigger new animation
    } catch {
      setPrompt("Ide backup: bayangkan jendela berbicara pada awan.");
      setKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Lightbulb className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            Morning Muse
          </h1>
          <Sparkles className="w-8 h-8 text-rose-500" />
        </div>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Prompt kreatif untuk memulai harimu dengan inspirasi segar
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card p-6 sm:p-8 lg:p-10 relative overflow-hidden"
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/50 pointer-events-none" />

        <div className="relative z-10">
          {/* Button */}
          <button
            onClick={fetchPrompt}
            disabled={loading}
            className="group relative w-full btn btn-primary py-4 sm:py-5 text-base sm:text-lg font-semibold overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Memetik ide...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>{prompt ? "Ide Lagi" : "Beri Saya Ide"}</span>
                  <Sparkles className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                </>
              )}
            </span>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>

          {/* Prompt Display */}
          <AnimatePresence mode="wait">
            {prompt && (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8 sm:mt-10"
              >
                {/* Quote decoration */}
                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-6xl sm:text-7xl text-amber-200/40 font-serif leading-none">
                    "
                  </div>

                  {/* Main prompt text */}
                  <div className="relative pl-4 sm:pl-8 pr-4 py-6 sm:py-8">
                    <TextGenerateEffect
                      words={prompt}
                      className="text-xl sm:text-2xl lg:text-3xl font-medium leading-relaxed tracking-wide text-slate-800"
                      duration={0.5}
                    />
                  </div>

                  <div className="absolute -bottom-2 -right-2 text-6xl sm:text-7xl text-rose-200/40 font-serif leading-none rotate-180">
                    "
                  </div>
                </div>

                {/* Decorative line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mt-6 h-1 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 rounded-full origin-left"
                />

                {/* Call to action */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 text-center text-sm sm:text-base text-slate-500 italic"
                >
                  Ambil napas dalam. Tulis, gambar, atau renungkan ide ini. ✨
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!prompt && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center py-12 sm:py-16"
            >
              <Lightbulb className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-amber-300" />
              <p className="text-slate-400 text-sm sm:text-base">
                Klik tombol di atas untuk mendapatkan ide kreatif random!
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Info tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 p-4 bg-amber-50/50 rounded-lg border border-amber-100"
      >
        <p className="text-xs sm:text-sm text-slate-600 text-center">
          💡 <strong>Tips:</strong> Gunakan prompt ini untuk journaling, brainstorming, atau sekadar memulai percakapan menarik!
        </p>
      </motion.div>
    </div>
  );
}
