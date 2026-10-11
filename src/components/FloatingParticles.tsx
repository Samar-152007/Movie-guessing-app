import { useMemo } from "react";
import { motion } from "framer-motion";

const EMOJIS = ["🎬", "🎭", "🎥", "🎞️", "🍿", "⭐", "🏆", "🎦"];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function FloatingParticles() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        x: Math.floor(Math.random() * 95),
        y: Math.floor(Math.random() * 95),
        size: Number((0.8 + Math.random() * 1.4).toFixed(2)),
        duration: Number((5 + Math.random() * 6).toFixed(1)),
        delay: Number((Math.random() * 4).toFixed(1)),
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}rem`,
            opacity: 0.06,
          }}
          animate={{
            y: [0, -24, -8, -20, 0],
            rotate: [0, 8, -5, 3, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
