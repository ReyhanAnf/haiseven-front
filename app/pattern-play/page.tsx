"use client";

import { useAuthStore } from "@/app/store/auth";
import { AnimatePresence, motion } from "framer-motion";
import { Circle, RotateCcw, Save, Square, Timer, Triangle, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const GAME_DURATION = 120; // 2 minutes

type Shape = "circle" | "square" | "triangle";
type Color = "blue" | "purple" | "orange";
type Fill = "solid" | "outline" | "striped";

interface Card {
  id: string;
  shape: Shape;
  color: Color;
  fill: Fill;
}

type GameState = "idle" | "playing" | "finished";

// Generate all 27 unique card combinations (3×3×3)
const generateDeck = (): Card[] => {
  const shapes: Shape[] = ["circle", "square", "triangle"];
  const colors: Color[] = ["blue", "purple", "orange"];
  const fills: Fill[] = ["solid", "outline", "striped"];

  const deck: Card[] = [];
  let idCounter = 0;

  for (const shape of shapes) {
    for (const color of colors) {
      for (const fill of fills) {
        deck.push({
          id: `card-${idCounter++}`,
          shape,
          color,
          fill,
        });
      }
    }
  }

  // Shuffle deck
  return deck.sort(() => Math.random() - 0.5);
};

// Core game logic: Check if 3 cards form a valid set
const isSet = (c1: Card, c2: Card, c3: Card): boolean => {
  // Check shape: all same OR all different
  const shapeValid =
    (c1.shape === c2.shape && c2.shape === c3.shape) ||
    (c1.shape !== c2.shape && c2.shape !== c3.shape && c1.shape !== c3.shape);

  // Check color: all same OR all different
  const colorValid =
    (c1.color === c2.color && c2.color === c3.color) ||
    (c1.color !== c2.color && c2.color !== c3.color && c1.color !== c3.color);

  // Check fill: all same OR all different
  const fillValid =
    (c1.fill === c2.fill && c2.fill === c3.fill) ||
    (c1.fill !== c2.fill && c2.fill !== c3.fill && c1.fill !== c3.fill);

  return shapeValid && colorValid && fillValid;
};

// Card visual component
const CardVisual = ({
  card,
  isSelected,
  isCorrect,
  isWrong,
  onClick
}: {
  card: Card;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onClick: () => void;
}) => {
  const colorClasses = {
    blue: {
      solid: "bg-gradient-to-br from-blue-500 to-blue-600",
      outline: "border-2 border-blue-500",
      striped: "bg-gradient-to-r from-blue-500 via-transparent to-blue-500",
      text: "text-blue-500"
    },
    purple: {
      solid: "bg-gradient-to-br from-purple-500 to-purple-600",
      outline: "border-2 border-purple-500",
      striped: "bg-gradient-to-r from-purple-500 via-transparent to-purple-500",
      text: "text-purple-500"
    },
    orange: {
      solid: "bg-gradient-to-br from-orange-400 to-orange-500",
      outline: "border-2 border-orange-500",
      striped: "bg-gradient-to-r from-orange-500 via-transparent to-orange-500",
      text: "text-orange-500"
    }
  };

  const ShapeIcon = card.shape === "circle" ? Circle : card.shape === "square" ? Square : Triangle;
  const colorClass = colorClasses[card.color];

  let fillClass = "";
  let iconClass = "";

  if (card.fill === "solid") {
    fillClass = colorClass.solid;
    iconClass = "text-white";
  } else if (card.fill === "outline") {
    fillClass = "bg-white";
    iconClass = colorClass.text;
  } else {
    fillClass = `${colorClass.striped} bg-repeat`;
    iconClass = colorClass.text;
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isCorrect ? {
          scale: [1, 1.1, 1],
          boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0)", "0 0 0 10px rgba(34, 197, 94, 0.2)", "0 0 0 0 rgba(34, 197, 94, 0)"]
        } : isWrong ? {
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        } : {}
      }
      className={`
        relative rounded-xl p-6 aspect-square flex items-center justify-center
        border transition-all duration-200
        ${isSelected
          ? "border-2 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-lg"
          : "border-slate-200/70 shadow-sm hover:shadow-md bg-white"
        }
        ${isCorrect ? "border-green-500 border-2" : ""}
        ${isWrong ? "border-red-500 border-2" : ""}
      `}
    >
      {/* Inner card content */}
      <div className={`
        absolute inset-1 rounded-lg flex items-center justify-center
        ${fillClass}
        ${card.fill === "striped" ? "bg-[length:20px_100%]" : ""}
      `}>
        <ShapeIcon
          className={`w-12 h-12 ${iconClass}`}
          fill={card.fill === "solid" ? "currentColor" : "none"}
          strokeWidth={card.fill === "outline" ? 3 : 2}
        />
      </div>
    </motion.button>
  );
};

export default function PatternPlayPage() {
  const { token } = useAuth();
  const { user, showLoginModal } = useAuthStore();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [deck, setDeck] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedbackState, setFeedbackState] = useState<"correct" | "wrong" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("finished");
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    const newDeck = generateDeck();
    setDeck(newDeck.slice(9)); // Reserve first 9 for board
    setBoard(newDeck.slice(0, 9));
    setSelectedCards([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
    setFeedbackState(null);
  };

  const handleCardClick = (card: Card) => {
    if (gameState !== "playing") return;
    if (feedbackState) return; // Block clicks during animation

    // Toggle selection
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      return;
    }

    if (selectedCards.length >= 3) return;

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    // Check if we have 3 cards selected
    if (newSelection.length === 3) {
      const valid = isSet(newSelection[0], newSelection[1], newSelection[2]);

      if (valid) {
        setFeedbackState("correct");
        setScore(s => s + 10);

        setTimeout(() => {
          // Replace the 3 cards with new ones from deck
          const newBoard = [...board];
          const newDeck = [...deck];

          newSelection.forEach(selectedCard => {
            const idx = newBoard.findIndex(c => c.id === selectedCard.id);
            if (idx !== -1 && newDeck.length > 0) {
              newBoard[idx] = newDeck.shift()!;
            }
          });

          setBoard(newBoard);
          setDeck(newDeck);
          setSelectedCards([]);
          setFeedbackState(null);
        }, 800);
      } else {
        setFeedbackState("wrong");
        setScore(s => Math.max(0, s - 3));

        setTimeout(() => {
          setSelectedCards([]);
          setFeedbackState(null);
        }, 800);
      }
    }
  };

  const saveScore = async () => {
    if (!user || !token) {
      showLoginModal("Login untuk menyimpan skor Pattern Play Anda!");
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/brain-warmup/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, game_type: "Pattern" }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan skor.");
      setSaveMessage("Skor tersimpan! ✨");
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Square className="w-6 h-6 text-white" />
          </div>
          Pattern Play
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Temukan set dari 3 kartu yang atributnya "Semua Sama" atau "Semua Berbeda"
        </p>
      </motion.div>

      {/* Idle State */}
      {gameState === "idle" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Circle className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Square className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Triangle className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Cara Bermain</h2>
            <div className="text-left space-y-3 mb-6 text-slate-700">
              <p>🎯 <strong>Tujuan:</strong> Temukan "Set" dari 3 kartu dalam waktu 2 menit</p>
              <p>✅ <strong>Set Valid:</strong> Setiap atribut (Bentuk, Warna, Isian) harus SEMUA SAMA atau SEMUA BERBEDA</p>
              <p>📊 <strong>Poin:</strong> +10 untuk set benar, -3 untuk set salah</p>
              <p>⏱️ <strong>Waktu:</strong> 120 detik untuk mendapat skor tertinggi!</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg mb-6 text-sm text-left">
              <p className="font-semibold mb-2">Contoh Set Valid:</p>
              <p>✓ 3 lingkaran biru solid (semua sama)</p>
              <p>✓ Lingkaran biru solid + Kotak ungu outline + Segitiga orange striped (semua berbeda)</p>
            </div>

            <button
              onClick={startGame}
              className="btn btn-primary text-lg px-8 py-4"
            >
              Mulai Bermain
            </button>
          </div>
        </motion.div>
      )}

      {/* Playing State */}
      {gameState === "playing" && (
        <div>
          {/* Stats Bar */}
          <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-500" />
              <span className="font-mono text-lg font-semibold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-lg font-semibold">{score} pts</span>
            </div>
            <div className="text-sm text-slate-600">
              Pilih 3 kartu: {selectedCards.length}/3
            </div>
          </div>

          {/* Game Board - 3x3 Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {board.map((card) => (
              <CardVisual
                key={card.id}
                card={card}
                isSelected={!!selectedCards.find(c => c.id === card.id)}
                isCorrect={feedbackState === "correct" && !!selectedCards.find(c => c.id === card.id)}
                isWrong={feedbackState === "wrong" && !!selectedCards.find(c => c.id === card.id)}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {feedbackState === "correct" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center p-3 bg-green-50 text-green-700 rounded-lg font-semibold"
              >
                ✓ Set Valid! +10 poin
              </motion.div>
            )}
            {feedbackState === "wrong" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center p-3 bg-red-50 text-red-700 rounded-lg font-semibold"
              >
                ✗ Bukan Set! -3 poin
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Finished State */}
      {gameState === "finished" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <Trophy className="w-20 h-20 mx-auto mb-4 text-amber-500" />
          <h2 className="text-3xl font-bold mb-2">Waktu Habis!</h2>
          <p className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text mb-6">
            {score} Poin
          </p>

          {saveMessage && (
            <div className={`mb-4 p-3 rounded-lg ${saveMessage.includes("tersimpan") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {saveMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={saveScore}
              disabled={saving}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? "Menyimpan..." : "Simpan Skor"}
            </button>
            <button
              onClick={startGame}
              className="btn btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Main Lagi
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Tip */}
      <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
        <p className="text-xs sm:text-sm text-slate-600 text-center">
          💡 <strong>Tips:</strong> Fokus pada satu atribut dulu (misal: bentuk), baru cek atribut lainnya!
        </p>
      </div>
    </div>
  );
}
