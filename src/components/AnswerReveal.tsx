import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Question, Settings } from "../types";
import { useSound } from "../hooks/useSound";

interface Props {
  question: Question;
  index: number;
  total: number;
  settings: Settings;
  onNext: () => void;
}

export default function AnswerReveal({ question, index, total, settings, onNext }: Props) {
  const sound = useSound(settings.enableSounds);
  const playedRef = useRef(false);
  const advancedRef = useRef(false);
  const [posterError, setPosterError] = useState(false);

  const handleAdvance = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    onNext();
  }, [onNext]);

  useEffect(() => {
    if (!playedRef.current) {
      playedRef.current = true;
      sound.reveal();
    }
  }, [sound]);

  useEffect(() => {
    if (!settings.autoNext) return;
    const t = setTimeout(handleAdvance, settings.revealDuration * 1000);
    return () => clearTimeout(t);
  }, [settings.autoNext, settings.revealDuration, handleAdvance]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAdvance]);

  const isLast = index + 1 === total;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 -z-10 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(168,85,247,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-2xl text-center">
        {/* Correct answer badge */}
        <motion.div
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-500/30 text-green-400 px-5 py-2 rounded-full text-sm font-mono font-medium">
            ✅ Correct Answer
          </div>
          <div className="text-white/30 text-xs font-mono mt-2">
            Question {index + 1} of {total}
          </div>
        </motion.div>

        {/* Poster / Fallback Card */}
        {question.poster && !posterError ? (
          <motion.div
            className="relative mx-auto mb-8 w-56 md:w-72"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.15 }}
          >
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-60"
              style={{ background: "linear-gradient(135deg, #a855f7, #60a5fa)" }}
            />
            <img
              src={question.poster}
              alt={question.answer}
              onError={() => setPosterError(true)}
              className="relative w-full rounded-3xl shadow-2xl object-cover aspect-[2/3] border border-white/10"
              style={{ boxShadow: "0 0 60px rgba(168,85,247,0.4)" }}
            />
          </motion.div>
        ) : (
          <motion.div
            className="relative mx-auto mb-8 w-56 md:w-72 aspect-[2/3] rounded-3xl glass flex flex-col items-center justify-center p-6 border border-yellow-500/30 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ boxShadow: "0 0 40px rgba(251,191,36,0.2)" }}
          >
            <span className="text-6xl mb-4">🎬</span>
            <span className="font-display text-2xl text-yellow-400 tracking-wider">
              {question.answer}
            </span>
            <span className="text-white/40 text-xs font-mono mt-2 uppercase tracking-widest">
              {question.category}
            </span>
          </motion.div>
        )}

        {/* Movie name */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 16 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">🎬</span>
            <h1
              className="font-display text-5xl md:text-7xl tracking-wider"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(251,191,36,0.5))",
              }}
            >
              {question.answer.toUpperCase()}
            </h1>
          </div>
          {question.emoji && (
            <div className="text-4xl mt-2 opacity-60">{question.emoji}</div>
          )}
        </motion.div>

        {/* Next button */}
        <motion.div
          className="flex justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className="btn-primary flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-semibold text-lg"
            onClick={handleAdvance}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {isLast ? (
              <>
                <span>🏆</span>
                Finish Quiz
              </>
            ) : (
              <>
                <ChevronRight size={20} />
                Next Question
                <span className="text-white/40 text-sm font-mono ml-1">[Space]</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Auto-next indicator */}
        {settings.autoNext && (
          <motion.div
            className="text-center mt-4 text-white/30 text-xs font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Auto-advancing in {settings.revealDuration}s…
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
