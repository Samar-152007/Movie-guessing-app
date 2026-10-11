import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";
import { useSound } from "../hooks/useSound";
import type { Settings } from "../types";

interface Props {
  total: number;
  elapsedMs: number;
  settings: Settings;
  onReplay: () => void;
  onHome: () => void;
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

const COLORS = ["#a855f7", "#60a5fa", "#fbbf24", "#f472b6", "#34d399", "#f87171"];

const confettiPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  color: COLORS[i % COLORS.length],
  size: 6 + Math.random() * 10,
  delay: Math.random() * 2,
  duration: 3 + Math.random() * 3,
}));

export default function FinalScreen({ total, elapsedMs, settings, onReplay, onHome }: Props) {
  const sound = useSound(settings.enableSounds);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!playedRef.current) {
      playedRef.current = true;
      const t = setTimeout(() => sound.complete(), 300);
      return () => clearTimeout(t);
    }
  }, [sound]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        onReplay();
      }
      if (e.key === "Escape") {
        onHome();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onReplay, onHome]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {confettiPieces.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: "-20px",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
            animate={{
              y: ["0px", "110vh"],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "easeIn",
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Background glow */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(168,85,247,0.2) 0%, rgba(96,165,250,0.1) 50%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.div
          className="text-8xl md:text-9xl mb-4"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        >
          🎉
        </motion.div>

        <motion.h1
          className="font-display text-6xl md:text-8xl mb-3"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          QUIZ COMPLETED!
        </motion.h1>

        <motion.p
          className="text-white/60 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Thank you! Hope you enjoyed the Orientation Movie Quiz.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass rounded-2xl p-6">
            <div className="font-display text-5xl neon-purple mb-1">{total}</div>
            <div className="text-white/40 text-sm font-mono uppercase tracking-wider">
              Total Questions
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="font-display text-5xl neon-blue mb-1">{formatTime(elapsedMs)}</div>
            <div className="text-white/40 text-sm font-mono uppercase tracking-wider">
              Time Taken
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <motion.button
            className="btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-lg"
            onClick={onReplay}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <RotateCcw size={20} />
            Play Again
          </motion.button>
          <motion.button
            className="btn-secondary flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-medium text-lg"
            onClick={onHome}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Home size={20} />
            Return Home
          </motion.button>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-10 text-white/20 text-sm font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          🎬 University Orientation Movie Quiz Edition
        </motion.p>
      </div>
    </motion.div>
  );
}
