import { useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Settings, Shuffle, LayoutGrid } from "lucide-react";
import FloatingParticles from "./FloatingParticles";

interface Props {
  onStart: () => void;
  onSettings: () => void;
  onAdmin: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  questionCount: number;
}

export default function WelcomeScreen({
  onStart,
  onSettings,
  onAdmin,
  shuffle,
  onToggleShuffle,
  questionCount,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onStart]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <FloatingParticles />

      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Icon */}
        <motion.div
          className="text-7xl md:text-9xl mb-6"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          🎬
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider mb-2"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #60a5fa 50%, #fbbf24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          MOVIE GUESS
        </motion.h1>
        <motion.h2
          className="font-display text-3xl md:text-5xl text-white/80 tracking-widest mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          CHALLENGE
        </motion.h2>

        <motion.p
          className="text-white/50 text-base md:text-lg mb-10 font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Guess the Movie from Emojis & Pictures
        </motion.p>

        {/* Stats bar */}
        <motion.div
          className="flex justify-center gap-6 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: "Questions", value: questionCount },
            { label: "Categories", value: "3" },
            { label: "Difficulty", value: "Mixed" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl px-4 py-2 text-center">
              <div className="font-display text-2xl neon-purple">{s.value}</div>
              <div className="text-white/40 text-xs font-mono uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <motion.button
            className="btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-lg min-w-44"
            onClick={onStart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Play size={22} fill="white" />
            Start Quiz
          </motion.button>

          <motion.button
            className={`btn-secondary flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-medium ${
              shuffle ? "border-purple-500/50 bg-purple-900/20" : ""
            }`}
            onClick={onToggleShuffle}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Shuffle size={18} />
            {shuffle ? "Shuffle: ON" : "Shuffle: OFF"}
          </motion.button>

          <motion.button
            className="btn-secondary flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-medium"
            onClick={onSettings}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Settings size={18} />
            Settings
          </motion.button>

          <motion.button
            className="btn-secondary flex items-center gap-3 px-6 py-4 rounded-2xl text-white/60 font-medium text-sm"
            onClick={onAdmin}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <LayoutGrid size={16} />
            Admin
          </motion.button>
        </motion.div>

        {/* Keyboard hint */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-3 text-white/30 text-xs font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            ["Space", "Next"],
            ["F", "Fullscreen"],
            ["P", "Pause"],
            ["R", "Restart"],
          ].map(([key, action]) => (
            <span key={key} className="flex items-center gap-1.5">
              <kbd className="glass px-2 py-0.5 rounded text-white/50">{key}</kbd>
              <span>{action}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
