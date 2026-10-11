import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Music, SkipForward, Shuffle, Maximize, Eye } from "lucide-react";
import type { Settings } from "../types";

interface Props {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const TIMER_OPTIONS = [10, 15, 20, 25, 30];

interface ToggleRowProps {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
}
function ToggleRow({ label, sub, value, onChange, icon }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div className="flex items-center gap-3">
        <span className="text-white/40">{icon}</span>
        <div>
          <div className="text-white/90 text-sm font-medium">{label}</div>
          {sub && <div className="text-white/30 text-xs">{sub}</div>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
          value ? "bg-purple-600" : "bg-white/10"
        }`}
      >
        <motion.span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
          animate={{ left: value ? "22px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

export default function SettingsPanel({ settings, onUpdate, onClose }: Props) {
  const [customValue, setCustomValue] = useState(String(settings.timerDuration));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Panel */}
      <motion.div
        className="relative glass rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl neon-purple">SETTINGS</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Timer duration */}
        <div className="mb-6">
          <div className="text-white/60 text-xs font-mono uppercase tracking-widest mb-3">
            Timer Duration
          </div>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  onUpdate({ timerDuration: t, customTimer: false });
                  setCustomValue(String(t));
                }}
                className={`py-2 rounded-xl text-sm font-mono font-medium transition-all ${
                  settings.timerDuration === t && !settings.customTimer
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-mono">Custom:</span>
            <input
              type="number"
              min="5"
              max="120"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onBlur={() => {
                const v = parseInt(customValue);
                if (!isNaN(v) && v >= 5) {
                  onUpdate({ timerDuration: v, customTimer: true });
                }
              }}
              className="w-20 text-center font-mono text-sm py-1.5 rounded-lg"
            />
            <span className="text-white/30 text-xs">seconds</span>
          </div>
        </div>

        {/* Reveal duration */}
        <div className="mb-6">
          <div className="text-white/60 text-xs font-mono uppercase tracking-widest mb-3">
            Answer Reveal Duration
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[3, 5, 7, 10, 15].map((t) => (
              <button
                key={t}
                onClick={() => onUpdate({ revealDuration: t })}
                className={`py-2 rounded-xl text-sm font-mono font-medium transition-all ${
                  settings.revealDuration === t
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-0">
          <ToggleRow
            label="Sound Effects"
            sub="Beeps, reveals & completion"
            value={settings.enableSounds}
            onChange={(v) => onUpdate({ enableSounds: v })}
            icon={<Volume2 size={16} />}
          />
          <ToggleRow
            label="Background Music"
            sub="Ambient cinema soundtrack"
            value={settings.enableMusic}
            onChange={(v) => onUpdate({ enableMusic: v })}
            icon={<Music size={16} />}
          />
          <ToggleRow
            label="Auto Reveal"
            sub="Show answer when timer ends"
            value={settings.autoReveal}
            onChange={(v) => onUpdate({ autoReveal: v })}
            icon={<Eye size={16} />}
          />
          <ToggleRow
            label="Auto Next Question"
            sub="Advance after reveal duration"
            value={settings.autoNext}
            onChange={(v) => onUpdate({ autoNext: v })}
            icon={<SkipForward size={16} />}
          />
          <ToggleRow
            label="Shuffle Questions"
            sub="Randomize question order"
            value={settings.shuffleQuestions}
            onChange={(v) => onUpdate({ shuffleQuestions: v })}
            icon={<Shuffle size={16} />}
          />
          <ToggleRow
            label="Fullscreen on Start"
            sub="Enter fullscreen automatically"
            value={settings.fullscreenOnStart}
            onChange={(v) => onUpdate({ fullscreenOnStart: v })}
            icon={<Maximize size={16} />}
          />
        </div>

        <motion.button
          className="btn-primary w-full mt-6 py-3 rounded-xl text-white font-semibold"
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save & Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
