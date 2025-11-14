"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ThoughtNode {
  id?: number;
  content: string;
  position_x: number;
  position_y: number;
  color: string;
  connections?: number[]; // Array of node indices this node connects to
}

interface ThoughtMap {
  id: number;
  title: string;
  nodes: ThoughtNode[];
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
];

export default function CanvasEditorPage() {
  const params = useParams();
  const mapId = params.mapId as string;
  const { token } = useAuth();
  const router = useRouter();

  const [map, setMap] = useState<ThoughtMap | null>(null);
  const [nodes, setNodes] = useState<ThoughtNode[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectFrom, setConnectFrom] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchMap();
  }, [token, mapId]);

  const fetchMap = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/thought-maps/${mapId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch map");
      const data = await res.json();
      setMap(data);
      setTitle(data.title);
      setNodes(data.nodes || []);
    } catch (error: any) {
      console.error(error);
      router.push("/canvas");
    } finally {
      setLoading(false);
    }
  };

  const saveMap = useCallback(async () => {
    if (!token || saving) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/thought-maps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ id: parseInt(mapId), title, nodes }),
      });
    } catch (error: any) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }, [token, mapId, title, nodes, saving]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveMap();
    }, 2000);
  }, [saveMap]);

  useEffect(() => {
    if (nodes.length > 0 && !loading) {
      debouncedSave();
    }
  }, [nodes, title, debouncedSave, loading]);

  const addNode = () => {
    const newNode: ThoughtNode = {
      content: "Ide baru...",
      position_x: window.innerWidth / 2 - canvasOffset.x - 75,
      position_y: window.innerHeight / 2 - canvasOffset.y - 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      connections: [],
    };
    setNodes([...nodes, newNode]);
  };

  const updateNodeContent = (index: number, content: string) => {
    const updated = [...nodes];
    updated[index].content = content;
    setNodes(updated);
  };

  const updateNodePosition = (index: number, x: number, y: number) => {
    const updated = [...nodes];
    updated[index].position_x = x;
    updated[index].position_y = y;
    setNodes(updated);
  };

  const deleteNode = (index: number) => {
    // Remove connections to this node from other nodes
    const updated = nodes.filter((_, i) => i !== index).map(node => ({
      ...node,
      connections: (node.connections || [])
        .filter(conn => conn !== index)
        .map(conn => conn > index ? conn - 1 : conn) // Adjust indices
    }));
    setNodes(updated);
  };

  const toggleConnection = (fromIndex: number, toIndex: number) => {
    const updated = [...nodes];
    if (!updated[fromIndex].connections) {
      updated[fromIndex].connections = [];
    }

    const connections = updated[fromIndex].connections!;
    const existingIndex = connections.indexOf(toIndex);

    if (existingIndex > -1) {
      // Remove connection
      connections.splice(existingIndex, 1);
    } else {
      // Add connection
      connections.push(toIndex);
    }

    setNodes(updated);
  };

  const startConnecting = (index: number) => {
    setIsConnecting(true);
    setConnectFrom(index);
  };

  const finishConnecting = (toIndex: number) => {
    if (isConnecting && connectFrom !== null && connectFrom !== toIndex) {
      toggleConnection(connectFrom, toIndex);
    }
    setIsConnecting(false);
    setConnectFrom(null);
  };

  const cancelConnecting = () => {
    setIsConnecting(false);
    setConnectFrom(null);
  };

  const handleNodeMouseDown = (index: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    e.stopPropagation();

    if (isConnecting) {
      finishConnecting(index);
      return;
    }

    setDraggedNode(index);
    const nodeElement = (e.currentTarget as HTMLElement);
    const rect = nodeElement.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleNodeTouchStart = (index: number, e: React.TouchEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    e.stopPropagation();
    e.preventDefault();

    if (isConnecting) {
      finishConnecting(index);
      return;
    }

    const touch = e.touches[0];
    const nodeElement = (e.currentTarget as HTMLElement);
    const rect = nodeElement.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });

    // Long press to start connecting
    const timer = setTimeout(() => {
      startConnecting(index);
    }, 500);
    setLongPressTimer(timer);
    setDraggedNode(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode !== null) {
      const x = (e.clientX - canvasOffset.x - dragOffset.x) / scale;
      const y = (e.clientY - canvasOffset.y - dragOffset.y) / scale;
      updateNodePosition(draggedNode, x, y);
    } else if (isPanning) {
      setCanvasOffset({
        x: canvasOffset.x + (e.clientX - panStart.x),
        y: canvasOffset.y + (e.clientY - panStart.y),
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const touch = e.touches[0];
    if (draggedNode !== null && !isConnecting) {
      e.preventDefault();
      const x = (touch.clientX - canvasOffset.x - dragOffset.x) / scale;
      const y = (touch.clientY - canvasOffset.y - dragOffset.y) / scale;
      updateNodePosition(draggedNode, x, y);
    } else if (isPanning) {
      e.preventDefault();
      setCanvasOffset({
        x: canvasOffset.x + (touch.clientX - panStart.x),
        y: canvasOffset.y + (touch.clientY - panStart.y),
      });
      setPanStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.target === canvasRef.current) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(Math.min(Math.max(0.5, scale + delta), 2));
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat canvas...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link href="/canvas" className="btn btn-ghost px-2 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg sm:text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 w-full min-w-0"
            placeholder="Judul canvas"
          />
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {saving && <span className="text-sm text-slate-500">Menyimpan...</span>}
          <button onClick={addNode} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Tambah Ide</span>
          </button>
          <button onClick={saveMap} className="btn btn-secondary flex items-center gap-2" disabled={saving}>
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">Simpan</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-move touch-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleCanvasTouchStart}
        onWheel={handleWheel}
        onClick={isConnecting ? cancelConnecting : undefined}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* SVG Layer for Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {nodes.map((node, fromIndex) =>
              (node.connections || []).map((toIndex) => {
                if (toIndex >= nodes.length) return null;
                const toNode = nodes[toIndex];
                const fromX = node.position_x + 95;
                const fromY = node.position_y + 50;
                const toX = toNode.position_x + 95;
                const toY = toNode.position_y + 50;

                return (
                  <g key={`${fromIndex}-${toIndex}`}>
                    <line
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke={node.color}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.5"
                    />
                    {/* Arrow head */}
                    <polygon
                      points={`${toX},${toY} ${toX - 8 * Math.cos(Math.atan2(toY - fromY, toX - fromX) - Math.PI / 6)},${toY - 8 * Math.sin(Math.atan2(toY - fromY, toX - fromX) - Math.PI / 6)} ${toX - 8 * Math.cos(Math.atan2(toY - fromY, toX - fromX) + Math.PI / 6)},${toY - 8 * Math.sin(Math.atan2(toY - fromY, toX - fromX) + Math.PI / 6)}`}
                      fill={node.color}
                      opacity="0.5"
                    />
                  </g>
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node, index) => (
            <div
              key={index}
              className={`absolute p-3 sm:p-4 rounded-xl shadow-lg cursor-move transition-all hover:shadow-xl touch-none ${
                isConnecting && connectFrom === index ? 'ring-4 ring-blue-400 ring-offset-2' : ''
              } ${isConnecting && connectFrom !== index ? 'opacity-70' : ''}`}
              style={{
                left: node.position_x,
                top: node.position_y,
                backgroundColor: node.color + "20",
                borderLeft: `4px solid ${node.color}`,
                minWidth: "140px",
                maxWidth: "250px",
                animation: draggedNode === index ? "none" : "nodeAppear 0.3s ease-out",
              }}
              onMouseDown={(e) => handleNodeMouseDown(index, e)}
              onTouchStart={(e) => handleNodeTouchStart(index, e)}
            >
              <textarea
                value={node.content}
                onChange={(e) => updateNodeContent(index, e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none font-medium text-sm sm:text-base"
                rows={3}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isConnecting) {
                      finishConnecting(index);
                    } else {
                      startConnecting(index);
                    }
                  }}
                  className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Hubungkan ke node lain"
                >
                  {isConnecting && connectFrom === index ? '✓ Pilih target' : '🔗'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(index);
                  }}
                  className="p-1 rounded hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connecting Mode Indicator */}
      {isConnecting && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full text-sm shadow-lg z-20 flex items-center gap-2">
          <span className="animate-pulse">🔗</span>
          <span className="hidden sm:inline">Pilih node tujuan untuk menghubungkan</span>
          <span className="sm:hidden">Tap node tujuan</span>
          <button
            onClick={cancelConnecting}
            className="ml-2 px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {/* Mobile Floating Action Buttons */}
      <div className="sm:hidden fixed bottom-6 right-4 flex flex-col gap-3 z-20">
        <button
          onClick={addNode}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="Tambah Ide"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={saveMap}
          disabled={saving}
          className="w-14 h-14 rounded-full bg-white text-slate-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center ring-1 ring-slate-200 disabled:opacity-50"
          aria-label="Simpan"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-6 left-4 z-20 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={() => setScale(Math.min(2, scale + 0.1))}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded transition-colors"
          aria-label="Zoom In"
        >
          <span className="text-xl font-bold">+</span>
        </button>
        <div className="w-10 text-center text-xs text-slate-500 py-1">
          {Math.round(scale * 100)}%
        </div>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded transition-colors"
          aria-label="Zoom Out"
        >
          <span className="text-xl font-bold">−</span>
        </button>
        <button
          onClick={() => {
            setScale(1);
            setCanvasOffset({ x: 0, y: 0 });
          }}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-xs font-medium"
          aria-label="Reset"
        >
          Reset
        </button>
      </div>

      {/* Help Tooltip - Show on first visit */}
      {nodes.length === 0 && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 max-w-sm z-20 animate-fade-in">
          <h3 className="font-bold text-lg mb-3 text-slate-900">Cara Menggunakan Canvas 🎨</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• <strong>Drag node</strong>: Geser untuk memindahkan</li>
            <li>• <strong>Long press</strong> (mobile): Tahan untuk mode koneksi</li>
            <li>• <strong>Klik 🔗</strong>: Hubungkan ke node lain</li>
            <li>• <strong>Geser canvas</strong>: Drag area kosong untuk pan</li>
            <li>• <strong>Pinch/Scroll</strong>: Zoom in/out</li>
          </ul>
          <button
            onClick={addNode}
            className="mt-4 w-full btn btn-primary"
          >
            Buat Node Pertama
          </button>
        </div>
      )}

      {/* Saving Indicator for Mobile */}
      {saving && (
        <div className="sm:hidden fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-20">
          Menyimpan...
        </div>
      )}

      <style jsx>{`
        @keyframes nodeAppear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
