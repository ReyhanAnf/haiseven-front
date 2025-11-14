"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Decision {
  id: number;
  title: string;
  pros: string[];
  cons: string[];
  created_at: string;
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
    <div className="card p-6 sm:p-8 mt-6 animate-fadeIn">
      <h2 className="text-xl font-bold mb-4">{decision?.id ? "Edit Keputusan" : "Buat Keputusan Baru"}</h2>
      <div className="mb-6">
        <label htmlFor="decision-title" className="block text-sm font-medium mb-1">
          Judul Keputusan
        </label>
        <input
          id="decision-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Pindah kerja?"
          className="input w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROS COLUMN */}
        <div className="pros-cons-col">
          <h3 className="text-lg font-bold text-green-400 mb-3">PRO</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newPro}
              onChange={(e) => setNewPro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('pro')}
              placeholder="Tambah item pro..."
              className="input flex-grow"
            />
            <button onClick={() => addItem('pro')} className="btn btn-primary px-3">+</button>
          </div>
          <ul className="space-y-2">
            {pros.map((item, index) => (
              <li key={`pro-${index}`} className="list-item pro-item">
                <span>{item}</span>
                <button onClick={() => removeItem('pro', index)} className="remove-btn">×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* CONS COLUMN */}
        <div className="pros-cons-col">
          <h3 className="text-lg font-bold text-red-400 mb-3">KONTRA</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCon}
              onChange={(e) => setNewCon(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('con')}
              placeholder="Tambah item kontra..."
              className="input flex-grow"
            />
            <button onClick={() => addItem('con')} className="btn btn-primary px-3">+</button>
          </div>
          <ul className="space-y-2">
            {cons.map((item, index) => (
              <li key={`con-${index}`} className="list-item con-item">
                <span>{item}</span>
                <button onClick={() => removeItem('con', index)} className="remove-btn">×</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(error || formError) && <p className="text-red-500 text-sm mt-6">{error || formError}</p>}

      <div className="mt-8 flex justify-end gap-3">
        <button onClick={onCancel} className="btn btn-ghost">Batal</button>
        <button onClick={handleSave} className="btn btn-secondary" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
};


export default function DecisionPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [currentDecision, setCurrentDecision] = useState<Partial<Decision> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDecisions = async () => {
    if (!token) return;
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
  }, [token]);

  if (!token) {
    router.push("/login");
    return null;
  }

  const handleSave = async (payload: { title: string; pros: string[]; cons: string[] }) => {
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
    setCurrentDecision(decision);
    setView('form');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Decision Maker</h1>
        {view === 'list' && (
          <button onClick={() => showForm(null)} className="btn btn-primary">
            + Buat Keputusan Baru
          </button>
        )}
      </div>
      <div className="deco-line mb-6" />

      {view === 'list' && (
        <div className="space-y-4">
          {loading && decisions.length === 0 && <p>Memuat keputusan...</p>}
          {!loading && decisions.length === 0 && (
            <div className="text-center py-10 px-6 bg-slate-800/50 rounded-lg">
              <h3 className="font-semibold text-lg">Belum ada keputusan.</h3>
              <p className="text-slate-400 mt-1">Mulai buat keputusan pertamamu sekarang!</p>
            </div>
          )}
          {decisions.map((d) => (
            <div key={d.id} className="decision-card">
              <div className="flex-grow">
                <h3 className="font-bold">{d.title}</h3>
                <div className="text-xs text-slate-400 mt-1 flex gap-4">
                    <span>PRO: {d.pros.length}</span>
                    <span>KONTRA: {d.cons.length}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => showForm(d)} className="btn btn-ghost">Edit</button>
                <button onClick={() => handleDelete(d.id)} className="btn btn-danger-ghost">Hapus</button>
              </div>
            </div>
          ))}
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

      <style jsx>{`
        .pros-cons-col {
          background-color: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          animation: fadeIn 0.3s ease-out;
        }
        .pro-item { background-color: rgba(74, 222, 128, 0.1); }
        .con-item { background-color: rgba(248, 113, 113, 0.1); }
        .remove-btn {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 1.2rem;
          line-height: 1;
          cursor: pointer;
          transition: color 0.2s;
        }
        .remove-btn:hover { color: #f87171; }
        .decision-card {
            display: flex;
            align-items: center;
            padding: 1rem 1.5rem;
            background-color: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.75rem;
            transition: background-color .2s, border-color .2s;
        }
        .decision-card:hover {
            background-color: rgba(255,255,255,0.07);
            border-color: rgba(255,255,255,0.15);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
