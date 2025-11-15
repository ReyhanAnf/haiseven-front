import { BrainCircuit, CheckCircle, Edit, GitBranch, HandHeart, Sparkles, Trash2, Wind } from 'lucide-react';
import Link from 'next/link';

// Main component for the Static Landing Page
export default function LandingPage() {
  return (
    <div className="bg-white text-slate-800 font-sans">
      <GradientBg />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

// Background decorative gradient
const GradientBg = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0 -z-10 overflow-hidden"
  >
    <div className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-50 via-white to-cyan-50 blur-3xl" />
  </div>
);

// Hero Section with headline, tagline, and CTA
const HeroSection = () => (
  <section className="relative mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-32">
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 sm:text-7xl">
        haiseven
      </h1>
      <p className="mt-6 text-lg leading-8 text-slate-600">
        Sapaan digital untuk membantumu memulai hari dengan sengaja.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link href="/register" className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90">
          Mulai Ritual Pagi Anda
        </Link>
      </div>
    </div>
    <HeroIllustration />
  </section>
);

// Abstract SVG illustration for the hero section
const HeroIllustration = () => (
  <div className="absolute inset-0 -z-10 mt-48 opacity-20 sm:opacity-30">
    <svg className="mx-auto h-full w-full" viewBox="0 0 1024 576">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M 100,100 C 200,200 400,50 500,150 S 700,300 900,200"
        stroke="url(#grad1)"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 50,300 C 150,400 350,250 450,350 S 650,500 850,400"
        stroke="url(#grad1)"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 8"
      />
    </svg>
  </div>
);

// Features Section with minimalist cards
const features = [
  {
    name: 'Daily Focus',
    description: 'Tentukan 3 prioritas utamamu untuk hari ini.',
    icon: CheckCircle,
    href: '/focus',
  },
  {
    name: 'Gratitude Jar',
    description: 'Catat hal-hal kecil yang kamu syukuri.',
    icon: HandHeart,
    href: '/gratitude',
  },
  {
    name: 'Morning Page',
    description: 'Tuangkan isi kepala tanpa filter selama 3 menit.',
    icon: Wind,
    href: '/morning-page',
  },
  {
    name: 'Positive Affirmation',
    description: 'Dapatkan kutipan positif acak untuk semangat.',
    icon: Sparkles,
    href: '/affirmation',
  },
  {
    name: 'Brain Warm-up (Math)',
    description: 'Latih kognitif dengan game matematika cepat.',
    icon: BrainCircuit,
    href: '/brain-warmup',
  },
  {
    name: 'Pattern Play',
    description: 'Asah logika dengan game puzzle pengenalan pola.',
    icon: BrainCircuit,
    href: '/pattern-play',
  },
  {
    name: 'Mental Unload',
    description: 'Buang pikiran negatif yang akan lenyap selamanya.',
    icon: Trash2,
    href: '/unload',
  },
  {
    name: 'Decision Maker',
    description: 'Bandingkan pro dan kontra untuk keputusan penting.',
    icon: GitBranch,
    href: '/decision',
  },
  {
    name: 'Morning Muse',
    description: 'Dapatkan ide kreatif untuk memulai tulisan atau harimu.',
    icon: Edit,
    href: '/muse',
  },
];

const FeaturesSection = () => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Perangkat Digital Ringan untuk Hari Anda.
      </h2>
      <p className="mt-4 text-lg text-slate-600">
        Setiap alat dirancang untuk fungsional, cepat, dan menenangkan.
      </p>
    </div>
    <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((feature) => (
        <Link
          key={feature.name}
          href={feature.href}
          className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md group"
        >
          <feature.icon className="h-8 w-8 text-blue-500 group-hover:text-cyan-500 transition-colors" strokeWidth={1.5} />
          <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{feature.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
        </Link>
      ))}
    </div>
  </section>
);

// Final Call-to-Action Section
const CtaSection = () => (
  <section className="bg-slate-50/70">
    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Siap memulai hari Anda?
      </h2>
      <div className="mt-8 flex justify-center">
        <Link href="/register" className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90">
          Daftar Gratis
        </Link>
      </div>
    </div>
  </section>
);

// Minimalist Footer
const Footer = () => (
  <footer className="bg-white">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} haiseven.
      </p>
    </div>
  </footer>
);
