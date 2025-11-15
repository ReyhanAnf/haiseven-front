"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useAuthStore } from "@/app/store/auth";
import { ArrowLeft, BarChart3, Edit, GitBranch, Plus, ThumbsDown, ThumbsUp, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CardSpotlight } from "../components/ui/card-spotlight";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Decision {
  id: number;
  title: string;
  pros: string[];
  cons: string[];
  created_at: string;
  updated_at: string;
}

// A single component for the form to avoid repetition
const DecisionForm = ({
  decision,
  onSave,
  onCancel,
  loading,
  error,
}: {
  decision: Partial<Decision> | null;
  onSave: (payload: { title: string; pros: string[]; cons: string[] }) => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
}) => {
  const [title, setTitle] = useState(decision?.title || "");
  const [pros, setPros] = useState<string[]>(decision?.pros || []);
  const [cons, setCons] = useState<string[]>(decision?.cons || []);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [formError, setFormError] = useState("");

  const addItem = (type: "pro" | "con") => {
    if (type === "pro" && newPro.trim()) {
      setPros([...pros, newPro.trim()]);
      setNewPro("");
    } else if (type === "con" && newCon.trim()) {
      setCons([...cons, newCon.trim()]);
      setNewCon("");
    }
  };

  const removeItem = (type: "pro" | "con", index: number) => {
    const list = type === "pro" ? pros : cons;
    const setter = type === "pro" ? setPros : setCons;
    setter(list.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setFormError("Judul keputusan tidak boleh kosong.");
      return;
    }
    setFormError("");
    onSave({ title, pros, cons });
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        {decision?.id ? "Edit Keputusan" : "Buat Keputusan Baru"}
      </h1>

      {(error || formError) && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error || formError}
        </div>
      )}

      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Judul Keputusan
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Pindah kerja ke startup?"
          className="input w-full text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROS SECTION */}
        <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-green-700">Alasan PRO</h3>
            <span className="ml-auto text-xl font-bold text-green-600">{pros.length}</span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPro}
              onChange={(e) => setNewPro(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem("pro")}
              placeholder="Tambah alasan pro..."
              className="input flex-1"
            />
            <button
              onClick={() => addItem("pro")}
              className="btn bg-green-500 text-white hover:bg-green-600 px-4"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <ul className="space-y-2">
            {pros.map((pro, idx) => (
              <li key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm group">
                <span className="flex-1 text-slate-700">{pro}</span>
                <button
                  onClick={() => removeItem("pro", idx)}
                  className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* CONS SECTION */}
        <div className="card p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsDown className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-red-700">Alasan KONTRA</h3>
            <span className="ml-auto text-xl font-bold text-red-600">{cons.length}</span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCon}
              onChange={(e) => setNewCon(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem("con")}
              placeholder="Tambah alasan kontra..."
              className="input flex-1"
            />
            <button
              onClick={() => addItem("con")}
              className="btn bg-red-500 text-white hover:bg-red-600 px-4"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <ul className="space-y-2">
            {cons.map((con, idx) => (
              <li key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm group">
                <span className="flex-1 text-slate-700">{con}</span>
                <button
                  onClick={() => removeItem("con", idx)}
                  className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="btn btn-ghost"
          disabled={loading}
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Menyimpan..." : decision?.id ? "Update Keputusan" : "Simpan Keputusan"}
        </button>
      </div>
    </div>
  );
};


export default function DecisionPage() {
  const { token } = useAuth();
  const { user, showLoginModal } = useAuthStore();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [currentDecision, setCurrentDecision] = useState<Partial<Decision> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate score for a decision
  const calculateScore = (decision: Decision) => {
    const prosCount = decision.pros.length;
    const consCount = decision.cons.length;
    const total = prosCount + consCount;
    const proPercentage = total > 0 ? (prosCount / total) * 100 : 50;
    return { prosCount, consCount, proPercentage };
  };

  const fetchDecisions = async () => {
    if (!user || !token) return; // Only load history if logged in
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/decisions`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Gagal memuat data.");
      const data = await res.json();
      setDecisions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, [user, token]);

  // No guard clause - page is public, everyone can try creating decisions

  const handleSave = async (payload: { title: string; pros: string[]; cons: string[] }) => {
    // Login-to-save pattern
    if (!user || !token) {
      showLoginModal("Login untuk menyimpan keputusan Anda dan lihat riwayat analisis!");
      return;
    }

    setLoading(true);
    setError("");
    const isUpdating = !!currentDecision?.id;
    const url = isUpdating ? `${API_BASE}/api/decisions/${currentDecision.id}` : `${API_BASE}/api/decisions`;
    const method = isUpdating ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menyimpan keputusan.");
      }
      setView('list');
      setCurrentDecision(null);
      await fetchDecisions(); // Refresh list
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Login check
    if (!user || !token) {
      showLoginModal("Login untuk menghapus keputusan Anda!");
      return;
    }

    if (!window.confirm("Apakah Anda yakin ingin menghapus keputusan ini?")) return;
    setLoading(true);
    try {
        await fetch(`${API_BASE}/api/decisions/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        await fetchDecisions(); // Refresh list
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const showForm = (decision: Partial<Decision> | null = null) => {
    // Login check before creating/editing
    if (!user || !token) {
      showLoginModal("Login untuk membuat atau mengedit keputusan!");
      return;
    }
    setCurrentDecision(decision);
    setView('form');
  };

  const showDetail = (decision: Decision) => {
    setCurrentDecision(decision);
    setView('detail');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20">
      {view === 'list' && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-purple-500" />
              Decision Maker
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Bandingkan pro & kontra untuk keputusan penting
            </p>
          </div>
          <button onClick={() => showForm(null)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Buat Keputusan
          </button>
        </div>
      )}
      {view !== 'list' && (
        <div className="mb-6">
          <button
            onClick={() => { setView('list'); setCurrentDecision(null); }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke List
          </button>
        </div>
      )}

      {view === 'list' && (
        <div>
          {loading && decisions.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-500">Memuat keputusan...</p>
            </div>
          )}
          {!loading && decisions.length === 0 && (
            <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
              <GitBranch className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">Belum ada keputusan</h3>
              <p className="text-sm sm:text-base text-slate-500 mb-4">
                Mulai dengan membuat keputusan pertamamu!
              </p>
              <button onClick={() => showForm(null)} className="btn btn-primary">
                Buat Keputusan Pertama
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decisions.map((decision) => {
              const { prosCount, consCount, proPercentage } = calculateScore(decision);
              return (
                <CardSpotlight
                  key={decision.id}
                  radius={220}
                  color={proPercentage >= 60 ? "rgba(16, 185, 129, 0.3)" : proPercentage >= 40 ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)"}
                >
                  <div
                    className="card p-5 hover:shadow-lg transition-shadow cursor-pointer bg-white/90"
                    onClick={() => showDetail(decision)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg flex-1">{decision.title}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showForm(decision);
                          }}
                          className="p-2 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(decision.id);
                          }}
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                  {/* Visual Comparison Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-green-500" />
                        {prosCount} Pro
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3 text-red-500" />
                        {consCount} Kontra
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                        style={{ width: `${proPercentage}%` }}
                      />
                      <div
                        className="bg-gradient-to-r from-red-400 to-rose-500 transition-all"
                        style={{ width: `${100 - proPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Score Indicator */}
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`px-3 py-1 rounded-full font-semibold ${
                        proPercentage >= 60
                          ? "bg-green-100 text-green-700"
                          : proPercentage >= 40
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {proPercentage >= 60 ? "✓ Promising" : proPercentage >= 40 ? "~ Balanced" : "⚠ Risky"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(decision.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  </div>
                </CardSpotlight>
              );
            })}
          </div>
        </div>
      )}

      {view === 'form' && (
        <DecisionForm
          decision={currentDecision}
          onSave={handleSave}
          onCancel={() => { setView('list'); setCurrentDecision(null); }}
          loading={loading}
          error={error}
        />
      )}

      {view === 'detail' && currentDecision && 'id' in currentDecision && (
        <div>
          {(() => {
            const decision = currentDecision as Decision;
            const { prosCount, consCount, proPercentage } = calculateScore(decision);

            return (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{decision.title}</h1>
                    <p className="text-slate-500 text-sm">
                      Dibuat {new Date(decision.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showForm(decision)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(decision.id)}
                      className="btn bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Score Card */}
                <div className="card p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-bold">Analisis Keputusan</h2>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{prosCount}</div>
                      <div className="text-sm text-slate-600">Alasan Pro</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{consCount}</div>
                      <div className="text-sm text-slate-600">Alasan Kontra</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{Math.round(proPercentage)}%</div>
                      <div className="text-sm text-slate-600">Pro Score</div>
                    </div>
                  </div>

                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex mb-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500"
                      style={{ width: `${proPercentage}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-red-400 to-rose-500"
                      style={{ width: `${100 - proPercentage}%` }}
                    />
                  </div>

                  <div className="text-center">
                    <span
                      className={`inline-block px-4 py-2 rounded-full font-bold ${
                        proPercentage >= 60
                          ? "bg-green-100 text-green-700"
                          : proPercentage >= 40
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {proPercentage >= 60
                        ? "✓ Keputusan ini cenderung menguntungkan"
                        : proPercentage >= 40
                        ? "~ Keputusan ini cukup seimbang"
                        : "⚠ Keputusan ini memiliki banyak risiko"}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ThumbsUp className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-bold text-green-700">Alasan PRO</h3>
                      <span className="ml-auto text-2xl font-bold text-green-600">{prosCount}</span>
                    </div>
                    {decision.pros.length === 0 ? (
                      <p className="text-slate-500 text-sm">Belum ada alasan pro</p>
                    ) : (
                      <ul className="space-y-3">
                        {decision.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                              {idx + 1}
                            </div>
                            <span className="flex-1 text-slate-700">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="card p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ThumbsDown className="w-6 h-6 text-red-600" />
                      <h3 className="text-xl font-bold text-red-700">Alasan KONTRA</h3>
                      <span className="ml-auto text-2xl font-bold text-red-600">{consCount}</span>
                    </div>
                    {decision.cons.length === 0 ? (
                      <p className="text-slate-500 text-sm">Belum ada alasan kontra</p>
                    ) : (
                      <ul className="space-y-3">
                        {decision.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                              {idx + 1}
                            </div>
                            <span className="flex-1 text-slate-700">{con}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}


    </div>
  );
}
