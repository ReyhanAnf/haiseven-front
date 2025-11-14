"use client";

import {
    ArrowRight,
    Award,
    Calendar,
    CheckCircle,
    Clock,
    GitBranch,
    HandHeart,
    Sparkles,
    TrendingUp,
    Wind
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Stats {
  totals: {
    focus: number;
    gratitude: number;
    morning_pages: number;
    decisions: number;
    canvas: number;
  };
  streaks: {
    focus: number;
    gratitude: number;
    morning_page: number;
  };
  recent: {
    focus: number;
    gratitude: number;
    morning_pages: number;
  };
  best_game_score: {
    score: number;
    game_type: string;
    date: string;
  } | null;
  activity_chart: Array<{
    date: string;
    focus: number;
    gratitude: number;
    morning_page: number;
  }>;
}

interface Activity {
  type: string;
  title: string;
  date: string;
  icon: string;
  data: any;
}

export default function DashboardPage() {
  const { user, token, getUser } = useAuth() as any;
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await getUser();

      const [statsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }),
        fetch(`${API_BASE}/api/dashboard/activity`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (activityRes.ok) setActivities(await activityRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Memuat dashboard...</p>
      </div>
    );
  }

  const quotes = [
    "Setiap hari adalah kesempatan baru 🌅",
    "Progress kecil masih progress 💪",
    "Tetap konsisten, hasil akan datang ⭐",
    "Kamu sudah melakukan yang terbaik hari ini 🎉",
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Selamat datang kembali, {user?.name || 'User'}! 👋</p>
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-700">{randomQuote}</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <StatCard
          title="Daily Focus"
          value={stats?.totals.focus || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          color="blue"
          streak={stats?.streaks.focus}
        />
        <StatCard
          title="Gratitude"
          value={stats?.totals.gratitude || 0}
          icon={<HandHeart className="w-5 h-5" />}
          color="pink"
          streak={stats?.streaks.gratitude}
        />
        <StatCard
          title="Morning Pages"
          value={stats?.totals.morning_pages || 0}
          icon={<Wind className="w-5 h-5" />}
          color="violet"
          streak={stats?.streaks.morning_page}
        />
        <StatCard
          title="Decisions"
          value={stats?.totals.decisions || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Canvas"
          value={stats?.totals.canvas || 0}
          icon={<GitBranch className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Aktivitas Terkini</h2>
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Belum ada aktivitas</p>
              <p className="text-slate-400 text-xs mt-1">Mulai gunakan fitur-fitur haiseven!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 6).map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Best Game Score */}
          {stats?.best_game_score && (
            <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-amber-600" />
                <h3 className="font-bold text-slate-900">Best Score</h3>
              </div>
              <p className="text-3xl font-bold text-amber-600">{stats.best_game_score.score}</p>
              <p className="text-sm text-slate-600 mt-1">Brain Warm-up</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionButton href="/focus" icon={<CheckCircle className="w-4 h-4" />} label="Daily Focus" />
              <QuickActionButton href="/gratitude" icon={<HandHeart className="w-4 h-4" />} label="Gratitude Jar" />
              <QuickActionButton href="/morning-page" icon={<Wind className="w-4 h-4" />} label="Morning Page" />
              <QuickActionButton href="/canvas" icon={<GitBranch className="w-4 h-4" />} label="Thought Canvas" />
            </div>
          </div>

          {/* Recent 7 Days */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold">7 Hari Terakhir</h3>
            </div>
            <div className="space-y-3">
              <RecentStat label="Daily Focus" value={stats?.recent.focus || 0} total={7} />
              <RecentStat label="Gratitude" value={stats?.recent.gratitude || 0} total={7} />
              <RecentStat label="Morning Pages" value={stats?.recent.morning_pages || 0} total={7} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  streak
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  streak?: number;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-400',
    pink: 'from-pink-500 to-rose-400',
    violet: 'from-violet-500 to-purple-400',
    amber: 'from-amber-500 to-orange-400',
    emerald: 'from-emerald-500 to-teal-400',
  }[color];

  return (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-600 mt-1">{title}</p>
      {streak !== undefined && streak > 0 && (
        <p className="text-xs text-blue-600 font-medium mt-2">🔥 {streak} hari berturut</p>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const iconMap: Record<string, React.ReactNode> = {
    CheckCircle: <CheckCircle className="w-4 h-4" />,
    HandHeart: <HandHeart className="w-4 h-4" />,
    Wind: <Wind className="w-4 h-4" />,
    GitBranch: <GitBranch className="w-4 h-4" />,
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 shrink-0">
        {iconMap[activity.icon]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
        <p className="text-xs text-slate-500 mt-1">
          {Array.isArray(activity.data)
            ? activity.data.join(', ')
            : activity.data}
        </p>
        <p className="text-xs text-slate-400 mt-1">{new Date(activity.date).toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="text-slate-600">{icon}</div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function RecentStat({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-semibold text-slate-900">{value}/{total}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
