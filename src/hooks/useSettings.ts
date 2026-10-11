import { useState, useEffect } from "react";
import type { Settings } from "../types";

const STORAGE_KEY = "movie-quiz-settings";

const defaults: Settings = {
  timerDuration: 20,
  customTimer: false,
  enableSounds: true,
  enableMusic: false,
  autoReveal: true,
  autoNext: true,
  shuffleQuestions: false,
  fullscreenOnStart: false,
  revealDuration: 5,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const reset = () => setSettings(defaults);

  return { settings, update, reset };
}
