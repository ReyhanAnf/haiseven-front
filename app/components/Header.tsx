"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function Header() {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Fallback token (avoid hydration flicker deciding which links to show)
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

  const hasSession = !!(token || persistedToken);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={hasSession ? "/dashboard" : "/"} className="text-2xl font-bold tracking-tight text-slate-900">
              haiseven
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden sm:flex items-center gap-4">
            {hasSession ? (
              <>
                <Link className="nav-link" href="/focus">Focus</Link>
                <Link className="nav-link" href="/morning-page">Morning Page</Link>
                <Link className="nav-link" href="/gratitude">Gratitude</Link>
                <Link className="nav-link" href="/decision">Decisions</Link>
                <Link className="nav-link" href="/canvas">Canvas</Link>
                <button onClick={() => logout()} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300/70 transition hover:bg-slate-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300/70 transition hover:bg-slate-50">
                  Login
                </Link>
                <Link href="/register" className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              className="btn btn-ghost px-2"
              aria-label="Toggle navigation"
              onClick={() => setOpen(o => !o)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {open && (
        <div className="sm:hidden px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-2 pt-2">
            {hasSession ? (
              <>
                <Link className="mobile-nav-link" href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link className="mobile-nav-link" href="/focus" onClick={() => setOpen(false)}>Daily Focus</Link>
                <Link className="mobile-nav-link" href="/morning-page" onClick={() => setOpen(false)}>Morning Page</Link>
                <Link className="mobile-nav-link" href="/gratitude" onClick={() => setOpen(false)}>Gratitude</Link>
                <Link className="mobile-nav-link" href="/brain-warmup" onClick={() => setOpen(false)}>Brain Warm-up</Link>
                <Link className="mobile-nav-link" href="/affirmation" onClick={() => setOpen(false)}>Affirmation</Link>
                <Link className="mobile-nav-link" href="/muse" onClick={() => setOpen(false)}>Morning Muse</Link>
                <Link className="mobile-nav-link" href="/unload" onClick={() => setOpen(false)}>Mental Unload</Link>
                <Link className="mobile-nav-link" href="/decision" onClick={() => setOpen(false)}>Decision Maker</Link>
                <Link className="mobile-nav-link" href="/canvas" onClick={() => setOpen(false)}>Thought Canvas</Link>
                <div className="border-t border-slate-200 my-2"></div>
                <button className="btn btn-secondary w-full" onClick={() => { logout(); setOpen(false); }}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost w-full" href="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link className="btn btn-secondary w-full" href="/register" onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

