import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Initializing...");

  useEffect(() => {
    const phases = [
      "Loading Movie Assets...",
      "Preparing Questions...",
      "Setting Up Projector...",
      "Lights, Camera, Action! 🎬",
    ];
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(onDone, 600);
      }
      setProgress(Math.min(p, 100));
      setPhase(phases[Math.min(Math.floor((p / 100) * phases.length), phases.length - 1)]);
    }, 180);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: "radial-gradient(ellipse at center, #1a0a2e 0%, #08081a 60%)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated logo */}
      <motion.div
        className="mb-10 text-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🎬
        </motion.div>
        <h1 className="font-display text-5xl md:text-7xl tracking-wider neon-purple">
          MOVIE QUIZ
        </h1>
        <p className="text-white/50 text-sm mt-2 font-mono tracking-widest uppercase">
          University Orientation Edition
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="w-72 md:w-96">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full progress-bar-fill rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.15 }}
          />
        </div>
        <div className="flex justify-between items-center">
          <motion.p
            key={phase}
            className="text-white/60 text-xs font-mono"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {phase}
          </motion.p>
          <span className="text-white/40 text-xs font-mono">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Spinning ring */}
      <motion.div
        className="mt-12 w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}
