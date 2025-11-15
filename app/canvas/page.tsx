"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useAuthStore } from "@/app/store/auth";
import { Map, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ThoughtMapItem {
  id: number;
  title: string;
  nodes_count: number;
  created_at: string;
  updated_at: string;
}

export default function CanvasListPage() {
  const { token } = useAuth();
  const { user, showLoginModal } = useAuthStore();
  const router = useRouter();
  const [maps, setMaps] = useState<ThoughtMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchMaps();
  }, [user, token]);

  const fetchMaps = async () => {
    if (!user || !token) return; // Only load if logged in
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/thought-maps`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch maps");
      const data = await res.json();
      setMaps(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createNewMap = async () => {
    // Login-to-save pattern
    if (!user || !token) {
      showLoginModal("Login untuk membuat dan menyimpan Thought Canvas Anda!");
      return;
    }
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/thought-maps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ title: newTitle, nodes: [] }),
      });
      if (!res.ok) throw new Error("Failed to create map");
      const newMap = await res.json();
      router.push(`/canvas/${newMap.id}`);
    } catch (error: any) {
      console.error(error);
      setCreating(false);
    }
  };

  // No guard clause - page is public, show empty state for guests

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Thought Canvas</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">Visual mind-mapping untuk ide-idemu</p>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm text-slate-700">
          💡 <strong>Tips:</strong> Geser node, hubungkan dengan 🔗, dan atur ide-idemu secara visual!
        </div>
      </div>

      {/* Create New Map Card */}
      <div className="card p-4 sm:p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-slate-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Plus className="w-5 h-5" />
          Buat Canvas Baru
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createNewMap()}
            placeholder="Judul canvas (misal: Ide Proyek Baru)"
            className="input flex-grow text-sm sm:text-base"
            disabled={creating}
          />
          <button
            onClick={createNewMap}
            className="btn btn-primary whitespace-nowrap"
            disabled={creating || !newTitle.trim()}
          >
            {creating ? "Membuat..." : "Buat"}
          </button>
        </div>
      </div>

      {/* Maps List */}
      {loading ? (
        <p className="text-center py-10 text-sm sm:text-base">Memuat canvas...</p>
      ) : maps.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-6 bg-slate-50 rounded-lg">
          <Map className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="font-semibold text-base sm:text-lg mb-2">Belum ada canvas</h3>
          <p className="text-sm sm:text-base text-slate-500">Mulai buat canvas pertamamu untuk memetakan ide-idemu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {maps.map((map) => (
            <Link
              key={map.id}
              href={`/canvas/${map.id}`}
              className="card p-4 sm:p-5 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{map.title}</h3>
              <p className="text-sm text-slate-500">
                {map.nodes_count} {map.nodes_count === 1 ? 'node' : 'nodes'}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Terakhir diupdate: {new Date(map.updated_at).toLocaleDateString('id-ID')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
