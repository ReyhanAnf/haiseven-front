"use client";

import { Award, Heart, Sparkles, TrendingUp } from "lucide-react";
import { CardSpotlight } from "../components/ui/card-spotlight";
import { DotBackground, GridBackground } from "../components/ui/grid-background";
import { MovingBorderButton } from "../components/ui/moving-border";
import { SparklesCore } from "../components/ui/sparkles";
import { TextGenerateEffect } from "../components/ui/text-generate-effect";

export default function ComponentsShowcase() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-500" />
          Aceternity UI Components
        </h1>
        <p className="text-slate-600">
          Implementasi komponen-komponen dari Aceternity UI untuk HaiSeven
        </p>
      </div>

      {/* Text Generate Effect */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Text Generate Effect</h2>
        <div className="card p-8">
          <TextGenerateEffect
            words="Selamat datang di HaiSeven! Platform mindfulness dan produktivitas yang dirancang untuk membantumu mencapai keseimbangan hidup yang lebih baik."
            className="text-xl"
          />
        </div>
      </section>

      {/* Card Spotlight */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Card Spotlight Effect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSpotlight className="p-6" radius={200} color="rgba(59, 130, 246, 0.4)">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900">127</p>
            <p className="text-sm text-slate-600 mt-1">Total Activities</p>
            <p className="text-xs text-blue-600 font-medium mt-2">🔥 7 hari berturut</p>
          </CardSpotlight>

          <CardSpotlight className="p-6" radius={200} color="rgba(236, 72, 153, 0.4)">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center text-white mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900">42</p>
            <p className="text-sm text-slate-600 mt-1">Gratitude Entries</p>
            <p className="text-xs text-pink-600 font-medium mt-2">🌸 Keep going!</p>
          </CardSpotlight>

          <CardSpotlight className="p-6" radius={200} color="rgba(139, 92, 246, 0.4)">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900">89</p>
            <p className="text-sm text-slate-600 mt-1">Morning Pages</p>
            <p className="text-xs text-violet-600 font-medium mt-2">✨ Amazing!</p>
          </CardSpotlight>

          <CardSpotlight className="p-6" radius={200} color="rgba(245, 158, 11, 0.4)">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white mb-4">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900">1,240</p>
            <p className="text-sm text-slate-600 mt-1">Best Score</p>
            <p className="text-xs text-amber-600 font-medium mt-2">🏆 Record!</p>
          </CardSpotlight>
        </div>
      </section>

      {/* Moving Border Button */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Moving Border Button</h2>
        <div className="card p-8 flex flex-wrap gap-4 items-center justify-center">
          <MovingBorderButton
            borderRadius="12px"
            className="px-6 py-3 font-semibold"
            duration="3s"
          >
            Mulai Sekarang
          </MovingBorderButton>

          <MovingBorderButton
            borderRadius="999px"
            className="px-8 py-3 font-semibold"
            duration="2s"
            borderClassName="bg-[radial-gradient(var(--grad-purple-start)_40%,transparent_60%)]"
          >
            Lihat Dashboard
          </MovingBorderButton>
        </div>
      </section>

      {/* Sparkles Effect */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Sparkles Effect</h2>
        <div className="card p-0 overflow-hidden h-64 relative">
          <SparklesCore
            background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={80}
            particleColor="#FFFFFF"
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-2">Congratulations! 🎉</h3>
              <p className="text-lg opacity-90">You've completed your daily streak!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Background */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Grid Background</h2>
        <GridBackground className="rounded-xl h-64 flex items-center justify-center border border-slate-200">
          <div className="text-center relative z-10">
            <h3 className="text-2xl font-bold mb-2">Grid Pattern Background</h3>
            <p className="text-slate-600">Perfect untuk sections dan containers</p>
          </div>
        </GridBackground>
      </section>

      {/* Dot Background */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Dot Background</h2>
        <DotBackground className="rounded-xl h-64 flex items-center justify-center border border-slate-200">
          <div className="text-center relative z-10">
            <h3 className="text-2xl font-bold mb-2">Dot Pattern Background</h3>
            <p className="text-slate-600">Subtle dan elegant untuk hero sections</p>
          </div>
        </DotBackground>
      </section>

      {/* Combined Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Combined Components</h2>
        <GridBackground className="rounded-xl p-8 border border-slate-200">
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <TextGenerateEffect
              words="Mulai perjalanan mindfulness kamu hari ini"
              className="text-3xl font-bold mb-6"
            />
            <p className="text-slate-600 mb-8">
              HaiSeven membantu kamu membangun kebiasaan positif dengan tools yang interaktif dan menyenangkan
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <MovingBorderButton
                borderRadius="12px"
                className="px-8 py-3 font-semibold"
                duration="2.5s"
              >
                Get Started
              </MovingBorderButton>
              <button className="btn btn-ghost px-8 py-3">
                Learn More
              </button>
            </div>
          </div>
        </GridBackground>
      </section>

      <div className="text-center text-sm text-slate-500 pt-8 border-t">
        <p>Komponen dari <a href="https://ui.aceternity.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Aceternity UI</a></p>
        <p className="mt-1">Diimplementasikan untuk HaiSeven dengan theme Web3 Gradient Minimalism</p>
      </div>
    </div>
  );
}
