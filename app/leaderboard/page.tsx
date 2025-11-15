"use client";

import { motion } from "framer-motion";
import {
    Award,
    BrainCircuit,
    Calendar,
    Crown,
    Flame,
    Medal,
    Square,
    TrendingUp,
    Trophy,
    Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface GameScore {
  id: number;
  user_id: number;
  user_name: string;
  score: number;
  game_type: string;
  created_at: string;
  rank?: number;
}

interface ActivityLeader {
  id: number;
  name: string;
  total_activities: number;
  focus_count: number;
  gratitude_count: number;
  morning_page_count: number;
  decision_count: number;
  canvas_count: number;
  streak_days: number;
  last_activity: string;
  rank?: number;
}

type LeaderboardType = "math" | "pattern" | "activity";

export default function LeaderboardPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaderboardType>("math");
  const [mathScores, setMathScores] = useState<GameScore[]>([]);
  const [patternScores, setPatternScores] = useState<GameScore[]>([]);
  const [activityLeaders, setActivityLeaders] = useState<ActivityLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchLeaderboards();
  }, [token]);

  const fetchLeaderboards = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [mathRes, patternRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/api/leaderboard/game/Math`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }),
        fetch(`${API_BASE}/api/leaderboard/game/Pattern`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }),
        fetch(`${API_BASE}/api/leaderboard/activity`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }),
      ]);

      if (mathRes.ok) {
        const data = await mathRes.json();
        setMathScores(data.map((item: GameScore, index: number) => ({ ...item, rank: index + 1 })));
      }

      if (patternRes.ok) {
        const data = await patternRes.json();
        setPatternScores(data.map((item: GameScore, index: number) => ({ ...item, rank: index + 1 })));
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivityLeaders(data.map((item: ActivityLeader, index: number) => ({ ...item, rank: index + 1 })));
      }

    } catch (err) {
      console.error("Failed to fetch leaderboards:", err);
      setError("Gagal memuat leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto text-amber-500 animate-pulse mb-3" />
          <p className="text-slate-500">Memuat leaderboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "math" as LeaderboardType,
      label: "Math Warmup",
      icon: <BrainCircuit className="w-5 h-5" />,
      color: "from-amber-500 to-orange-500"
    },
    {
      id: "pattern" as LeaderboardType,
      label: "Pattern Play",
      icon: <Square className="w-5 h-5" />,
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: "activity" as LeaderboardType,
      label: "Most Active",
      icon: <Users className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-500"
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">#{rank}</div>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default:
        return "bg-white border-slate-200";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="w-10 h-10 text-amber-500" />
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
        </div>
        <p className="text-slate-600 text-sm sm:text-base">
          Kompetisi sehat untuk motivasi dan pencapaian bersama
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card p-6 text-center text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* Math Warmup Leaderboard */}
      {activeTab === "math" && (
        <motion.div
          key="math"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold">Math Warmup Champions</h2>
              <Link
                href="/brain-warmup"
                className="ml-auto text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Play Game →
              </Link>
            </div>

            {mathScores.length === 0 ? (
              <div className="text-center py-12">
                <BrainCircuit className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 mb-2">Belum ada skor</p>
                <p className="text-slate-400 text-sm">Jadilah yang pertama bermain!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mathScores.slice(0, 10).map((score) => (
                  <div
                    key={score.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${getRankBg(score.rank!)}`}
                  >
                    {getRankIcon(score.rank!)}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{score.user_name}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(score.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{score.score}</p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Pattern Play Leaderboard */}
      {activeTab === "pattern" && (
        <motion.div
          key="pattern"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Square className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Pattern Play Masters</h2>
              <Link
                href="/pattern-play"
                className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Play Game →
              </Link>
            </div>

            {patternScores.length === 0 ? (
              <div className="text-center py-12">
                <Square className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 mb-2">Belum ada skor</p>
                <p className="text-slate-400 text-sm">Jadilah yang pertama bermain!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patternScores.slice(0, 10).map((score) => (
                  <div
                    key={score.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${getRankBg(score.rank!)}`}
                  >
                    {getRankIcon(score.rank!)}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{score.user_name}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(score.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{score.score}</p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Activity Leaderboard */}
      {activeTab === "activity" && (
        <motion.div
          key="activity"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-bold">Most Active Users</h2>
              <Link
                href="/dashboard"
                className="ml-auto text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Dashboard →
              </Link>
            </div>

            {activityLeaders.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 mb-2">Belum ada aktivitas</p>
                <p className="text-slate-400 text-sm">Mulai gunakan fitur haiseven!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLeaders.slice(0, 10).map((leader) => (
                  <div
                    key={leader.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${getRankBg(leader.rank!)}`}
                  >
                    {getRankIcon(leader.rank!)}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{leader.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {leader.streak_days} hari streak
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leader.last_activity).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        {leader.focus_count > 0 && <span className="text-blue-600">Focus: {leader.focus_count}</span>}
                        {leader.gratitude_count > 0 && <span className="text-pink-600">Gratitude: {leader.gratitude_count}</span>}
                        {leader.morning_page_count > 0 && <span className="text-violet-600">Morning: {leader.morning_page_count}</span>}
                        {leader.decision_count > 0 && <span className="text-purple-600">Decision: {leader.decision_count}</span>}
                        {leader.canvas_count > 0 && <span className="text-emerald-600">Canvas: {leader.canvas_count}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">{leader.total_activities}</p>
                      <p className="text-xs text-slate-500">activities</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* CTA Section */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/brain-warmup"
          className="card p-4 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-amber-500" />
            <div>
              <p className="font-semibold group-hover:text-amber-600 transition-colors">Math Warmup</p>
              <p className="text-sm text-slate-500">Test your calculation speed</p>
            </div>
          </div>
        </Link>

        <Link
          href="/pattern-play"
          className="card p-4 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <Square className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="font-semibold group-hover:text-indigo-600 transition-colors">Pattern Play</p>
              <p className="text-sm text-slate-500">Challenge your pattern recognition</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="card p-4 hover:shadow-md transition-all group sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="font-semibold group-hover:text-emerald-600 transition-colors">Your Progress</p>
              <p className="text-sm text-slate-500">Track your daily activities</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
