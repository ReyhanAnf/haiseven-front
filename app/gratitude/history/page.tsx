"use client";

import { CardSpotlight } from "@/app/components/ui/card-spotlight";
import { useAuth } from "@/app/hooks/useAuth";
import { Calendar, HandHeart, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface GratitudeEntry {
  id: number;
  text: string;
  created_at: string;
}

export default function GratitudeHistoryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchEntries();
  }, [token]);

  const fetchEntries = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gratitude`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch gratitude");
      const data = await res.json();
      setEntries(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = !searchTerm || entry.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === "all" || entry.created_at.startsWith(selectedMonth);
    return matchesSearch && matchesMonth;
  });

  const groupedByDate = filteredEntries.reduce((acc, entry) => {
    const date = entry.created_at.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, GratitudeEntry[]>);

  const sortedDates = Object.keys(groupedByDate).sort().reverse();

  // Get available months
  const availableMonths = Array.from(
    new Set(entries.map((e) => e.created_at.substring(0, 7)))
  ).sort().reverse();

  if (!token) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <HandHeart className="w-7 h-7 text-pink-500" />
            Gratitude Journal
          </h1>
          <Link href="/gratitude" className="btn btn-primary text-sm">
            Kembali
          </Link>
        </div>
        <p className="text-slate-600 text-sm sm:text-base">
          Semua hal yang pernah kamu syukuri ❤️
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari dalam gratitude journal..."
            className="input w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input flex-1 text-sm"
          >
            <option value="all">Semua Bulan</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(month + "-01").toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries Timeline */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-slate-500">Memuat journal...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
          <HandHeart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="font-semibold text-base sm:text-lg mb-2">
            {searchTerm || selectedMonth !== "all"
              ? "Tidak ada hasil"
              : "Belum ada gratitude"}
          </h3>
          <p className="text-sm sm:text-base text-slate-500">
            {searchTerm || selectedMonth !== "all"
              ? "Coba filter atau kata kunci lain"
              : "Mulai tuliskan rasa syukurmu hari ini!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-sm font-semibold text-slate-900 bg-gradient-to-r from-pink-100 to-rose-100 px-3 py-1 rounded-full">
                  {new Date(date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupedByDate[date].map((entry) => (
                  <CardSpotlight key={entry.id} radius={180} color="rgba(236, 72, 153, 0.3)">
                    <div className="card p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700 flex-1 text-sm sm:text-base">
                          {entry.text}
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </CardSpotlight>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && entries.length > 0 && (
        <div className="mt-8 card p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-pink-500" />
            Statistik Gratitude
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-pink-600">
                {entries.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Total Gratitude</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-rose-600">
                {new Set(entries.map((e) => e.created_at.split("T")[0])).size}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Hari Bersyukur</div>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {availableMonths.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Bulan Berkarya</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
