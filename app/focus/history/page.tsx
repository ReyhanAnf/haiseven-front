"use client";

import { CardSpotlight } from "@/app/components/ui/card-spotlight";
import { useAuth } from "@/app/hooks/useAuth";
import { Calendar, CheckCircle, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface FocusItem {
  content: string;
  completed: boolean;
}

interface FocusHistory {
  id: number;
  date: string;
  items: FocusItem[];
}

export default function FocusHistoryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<FocusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/focus/history`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const items = item.items || [];
    return (
      item.date.includes(search) ||
      items.some((i) => i.content.toLowerCase().includes(search))
    );
  });

  const groupedByMonth = filteredHistory.reduce((acc, item) => {
    const month = item.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, FocusHistory[]>);

  const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

  if (!token) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Riwayat Daily Focus</h1>
          <Link href="/focus" className="btn btn-primary text-sm">
            Kembali ke Focus
          </Link>
        </div>
        <p className="text-slate-600 text-sm sm:text-base">
          Lihat semua daily focus yang pernah kamu buat
        </p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan tanggal atau konten..."
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-slate-500">Memuat riwayat...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="font-semibold text-base sm:text-lg mb-2">
            {searchTerm ? "Tidak ada hasil" : "Belum ada riwayat"}
          </h3>
          <p className="text-sm sm:text-base text-slate-500">
            {searchTerm
              ? "Coba kata kunci lain"
              : "Mulai buat daily focus pertamamu!"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map((month) => (
            <div key={month}>
              <h2 className="text-xl font-bold mb-4 text-slate-700">
                {new Date(month + "-01").toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                })}
              </h2>
              <div className="space-y-3">
                {groupedByMonth[month].map((item) => {
                  const items = item.items || [];
                  const allCompleted = items.length > 0 && items.every((i) => i.completed);
                  const completedCount = items.filter((i) => i.completed).length;

                  return (
                    <CardSpotlight
                      key={item.id}
                      radius={200}
                      color={allCompleted ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)"}
                    >
                      <div className="card p-4 sm:p-5 hover:shadow-md transition-shadow bg-white/90">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold text-slate-900">
                              {new Date(item.date).toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              allCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {completedCount}/{items.length} selesai
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {items.map((focusItem, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle
                              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                focusItem.completed
                                  ? "text-green-500"
                                  : "text-slate-300"
                              }`}
                            />
                            <span
                              className={`flex-1 ${
                                focusItem.completed
                                  ? "line-through text-slate-500"
                                  : "text-slate-700"
                              }`}
                            >
                              {focusItem.content}
                            </span>
                          </li>
                        ))}
                        </ul>
                      </div>
                    </CardSpotlight>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && history.length > 0 && (() => {
        const totalItems = history.reduce((sum, h) => sum + (h.items?.length || 0), 0);
        const completedItems = history.reduce(
          (sum, h) => sum + (h.items?.filter((i) => i.completed).length || 0),
          0
        );
        const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        return (
          <div className="mt-8 card p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="font-bold text-lg mb-4">Statistik</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {history.length}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 mt-1">Total Hari</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {totalItems}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 mt-1">Total Item</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                  {completedItems}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 mt-1">Selesai</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {completionRate}%
                </div>
                <div className="text-xs sm:text-sm text-slate-600 mt-1">Completion Rate</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
