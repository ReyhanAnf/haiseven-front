"use client";

import { motion } from "framer-motion";
import {
    GitBranch,
    HandHeart,
    LayoutDashboard,
    LogOut,
    Menu,
    Palette,
    Sparkles,
    Target,
    User,
    Wind,
    X
} from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={hasSession ? "/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              haiseven
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {hasSession ? (
              <>
                <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard
                </NavLink>
                <NavLink href="/focus" icon={<Target className="w-4 h-4" />}>
                  Focus
                </NavLink>
                <NavLink href="/morning-page" icon={<Wind className="w-4 h-4" />}>
                  Morning
                </NavLink>
                <NavLink href="/gratitude" icon={<HandHeart className="w-4 h-4" />}>
                  Gratitude
                </NavLink>
                <NavLink href="/decision" icon={<GitBranch className="w-4 h-4" />}>
                  Decisions
                </NavLink>
                <NavLink href="/canvas" icon={<Palette className="w-4 h-4" />}>
                  Canvas
                </NavLink>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <NavLink href="/profile" icon={<User className="w-4 h-4" />}>
                  Profile
                </NavLink>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => logout()}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
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
                <Link className="mobile-nav-link" href="/profile" onClick={() => setOpen(false)}>Profile</Link>
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

// NavLink Component
function NavLink({
  href,
  icon,
  children
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
