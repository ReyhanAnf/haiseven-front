"use client";

import { CardSpotlight } from "@/app/components/ui/card-spotlight";
import { TextGenerateEffect } from "@/app/components/ui/text-generate-effect";
import { useAuth } from "@/app/hooks/useAuth";
import { BookOpen, Calendar, Search, Wind } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MorningPageEntry {
  id: number;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function MorningPageHistoryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<MorningPageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<MorningPageEntry | null>(null);

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
      const res = await fetch(`${API_BASE}/api/morning-page`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch morning pages");
      const data = await res.json();
      setEntries(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = !searchTerm || entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === "all" || entry.date.startsWith(selectedMonth);
    return matchesSearch && matchesMonth;
  });

  const groupedByMonth = filteredEntries.reduce((acc, entry) => {
    const month = entry.date.substring(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {} as Record<string, MorningPageEntry[]>);

  const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

  // Get available months
  const availableMonths = Array.from(
    new Set(entries.map((e) => e.date.substring(0, 7)))
  ).sort().reverse();

  if (!token) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Wind className="w-7 h-7 text-cyan-500" />
            Morning Pages Archive
          </h1>
          <Link href="/morning-page" className="btn btn-primary text-sm">
            Kembali
          </Link>
        </div>
        <p className="text-slate-600 text-sm sm:text-base">
          Semua morning pages yang pernah kamu tulis
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
            placeholder="Cari dalam morning pages..."
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

      {/* Entries Grid */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-slate-500">Memuat pages...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="font-semibold text-base sm:text-lg mb-2">
            {searchTerm || selectedMonth !== "all"
              ? "Tidak ada hasil"
              : "Belum ada morning pages"}
          </h3>
          <p className="text-sm sm:text-base text-slate-500">
            {searchTerm || selectedMonth !== "all"
              ? "Coba filter atau kata kunci lain"
              : "Mulai tulis morning page pertamamu!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List View */}
          <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto">
            {sortedMonths.map((month) => (
              <div key={month}>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 px-2">
                  {new Date(month + "-01").toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                  })}
                </h3>
                {groupedByMonth[month].map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedEntry?.id === entry.id
                        ? "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 shadow-sm"
                        : "bg-white border-slate-200 hover:border-cyan-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm font-medium">
                        {new Date(entry.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {entry.content.substring(0, 60)}...
                    </p>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Content View */}
          <div className="lg:col-span-2">
            {selectedEntry ? (
              <CardSpotlight radius={250} color="rgba(6, 182, 212, 0.3)">
                <div className="card p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {new Date(selectedEntry.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Ditulis pukul{" "}
                        {new Date(selectedEntry.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Wind className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <div className="prose prose-slate max-w-none">
                      <TextGenerateEffect
                        words={selectedEntry.content}
                        duration={0.2}
                        className="whitespace-pre-wrap text-slate-700 leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <span>{selectedEntry.content.split(/\s+/).length} kata</span>
                    <span>•</span>
                    <span>{selectedEntry.content.length} karakter</span>
                  </div>
                </div>
              </CardSpotlight>
            ) : (
              <div className="card p-12 text-center bg-slate-50">
                <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">
                  Pilih morning page dari daftar untuk membaca
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && entries.length > 0 && (
        <div className="mt-8 card p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-500" />
            Statistik Morning Pages
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-600">
                {entries.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Total Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {entries.reduce((sum, e) => sum + e.content.split(/\s+/).length, 0)}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Total Kata</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {availableMonths.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Bulan Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                {Math.round(
                  entries.reduce((sum, e) => sum + e.content.split(/\s+/).length, 0) /
                    entries.length
                )}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Rata-rata Kata</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
