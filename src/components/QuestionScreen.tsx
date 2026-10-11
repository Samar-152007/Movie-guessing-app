import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, SkipForward, RotateCcw, Maximize, Minimize } from "lucide-react";
import type { Question, Settings } from "../types";
import { useSound } from "../hooks/useSound";

interface Props {
  question: Question;
  index: number;
  total: number;
  settings: Settings;
  onReveal: () => void;
  onRestart: () => void;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function QuestionScreen({
  question,
  index,
  total,
  settings,
  onReveal,
  onRestart,
}: Props) {
  const duration = settings.timerDuration;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRevealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealedRef = useRef(false);
  const sound = useSound(settings.enableSounds);

  const isRed = timeLeft <= 5;
  const progress = (timeLeft / duration) * CIRCUMFERENCE;

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRevealTimeoutRef.current) clearTimeout(autoRevealTimeoutRef.current);
    sound.timerEnd();
    onReveal();
  }, [onReveal, sound]);

  useEffect(() => {
    revealedRef.current = false;
    setTimeLeft(duration);
    setPaused(false);
    setImgError(false);
  }, [question.id, duration]);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (settings.autoReveal) {
            autoRevealTimeoutRef.current = setTimeout(reveal, 200);
          }
          return 0;
        }
        if (t <= 6) sound.tick();
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoRevealTimeoutRef.current) clearTimeout(autoRevealTimeoutRef.current);
    };
  }, [paused, question.id, settings.autoReveal, reveal, sound]);

  // Sync fullscreen state with document events
  useEffect(() => {
    const handleFsChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space") {
        e.preventDefault();
        reveal();
      }
      if (e.key === "p" || e.key === "P") setPaused((p) => !p);
      if (e.key === "r" || e.key === "R") onRestart();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [reveal, onRestart, toggleFullscreen]);

  const difficultyColor = {
    easy: "text-green-400 border-green-400/30 bg-green-900/20",
    medium: "text-yellow-400 border-yellow-400/30 bg-yellow-900/20",
    hard: "text-red-400 border-red-400/30 bg-red-900/20",
  }[question.difficulty];

  const categoryLabel = {
    hollywood: "🎬 Hollywood",
    bollywood: "🎥 Bollywood",
    tollywood: "🎞️ Tollywood",
    korean: "🇰🇷 Korean",
    other: "🌍 World",
  }[question.category];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header row */}
      <div className="w-full max-w-3xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl md:text-3xl text-white/80">
              Q{index + 1}
            </span>
            <span className="text-white/30 font-mono text-sm">/ {total}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${difficultyColor}`}>
              {question.difficulty.toUpperCase()}
            </span>
            <span className="text-white/30 text-xs font-mono">{categoryLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaused((p) => !p)}
              className="btn-secondary p-2 rounded-xl"
              title="P to pause"
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button onClick={toggleFullscreen} className="btn-secondary p-2 rounded-xl" title="F">
              {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
            <button onClick={onRestart} className="btn-secondary p-2 rounded-xl" title="R">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full progress-bar-fill rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main card */}
      <motion.div
        className="glass rounded-3xl p-8 md:p-12 w-full max-w-3xl flex flex-col items-center gap-8"
        layout
      >
        {/* Clue display */}
        <div className="text-center">
          {question.emoji ? (
            <motion.div
              className="text-7xl md:text-9xl leading-none select-none drop-shadow-lg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
            >
              {question.emoji}
            </motion.div>
          ) : question.image && !imgError ? (
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={question.image}
                alt="Clue"
                className="max-h-64 mx-auto rounded-2xl object-contain"
                onError={() => setImgError(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center p-8 rounded-2xl border border-white/10 bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-5xl mb-2">🎬</span>
              <span className="text-white/40 text-sm font-mono">Guess the movie from the category & difficulty!</span>
            </motion.div>
          )}
        </div>

        {/* Circular timer */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Track */}
              <circle
                cx="60" cy="60" r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              {/* Animated arc */}
              <motion.circle
                cx="60" cy="60" r={RADIUS}
                fill="none"
                stroke={isRed ? "#ef4444" : "#a855f7"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE - progress}
                className={isRed ? "timer-red" : ""}
                style={{
                  filter: isRed
                    ? "drop-shadow(0 0 8px rgba(239,68,68,0.9))"
                    : "drop-shadow(0 0 8px rgba(168,85,247,0.8))",
                  transition: "stroke-dashoffset 1s linear, stroke 0.3s",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={timeLeft}
                  className={`font-display text-4xl ${isRed ? "text-red-400" : "text-white"}`}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {timeLeft}
                </motion.span>
              </AnimatePresence>
              <span className="text-white/30 text-xs font-mono">sec</span>
            </div>
          </div>

          {paused && (
            <motion.div
              className="text-yellow-400 text-sm font-mono animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ⏸ PAUSED
            </motion.div>
          )}
        </div>

        {/* Reveal button */}
        <motion.button
          className="btn-primary flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-semibold text-lg"
          onClick={reveal}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <SkipForward size={20} />
          Reveal Answer
          <span className="text-white/40 text-sm font-mono ml-1">[Space]</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
