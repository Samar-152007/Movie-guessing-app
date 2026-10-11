import { useRef, useCallback, useEffect } from "react";

function createCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

export function useSound(enabled: boolean, musicEnabled: boolean = false) {
  const ctxRef = useRef<AudioContext | null>(null);
  const musicNodesRef = useRef<{
    oscs: OscillatorNode[];
    gain: GainNode;
  } | null>(null);

  const ctx = useCallback(() => {
    if (!enabled && !musicEnabled) return null;
    try {
      if (!ctxRef.current) {
        ctxRef.current = createCtx();
      }
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, [enabled, musicEnabled]);

  // Ambient cinema music synthesizer
  useEffect(() => {
    if (!musicEnabled) {
      if (musicNodesRef.current) {
        const { oscs, gain } = musicNodesRef.current;
        try {
          if (ctxRef.current) {
            gain.gain.linearRampToValueAtTime(0.0001, ctxRef.current.currentTime + 0.8);
            setTimeout(() => {
              oscs.forEach((o) => {
                try {
                  o.stop();
                  o.disconnect();
                } catch {}
              });
            }, 900);
          }
        } catch {}
        musicNodesRef.current = null;
      }
      return;
    }

    const c = ctx();
    if (!c) return;

    try {
      // Warm cinematic drone frequencies (C-minor/major ambient cluster)
      const freqs = [130.81, 164.81, 196.0, 261.63];
      const masterGain = c.createGain();
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;

      masterGain.gain.setValueAtTime(0.0001, c.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.04, c.currentTime + 1.5);

      masterGain.connect(filter);
      filter.connect(c.destination);

      const oscs = freqs.map((f, i) => {
        const osc = c.createOscillator();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.value = f + (Math.random() - 0.5) * 1.5;
        osc.connect(masterGain);
        osc.start(c.currentTime);
        return osc;
      });

      musicNodesRef.current = { oscs, gain: masterGain };
    } catch {}

    return () => {
      if (musicNodesRef.current) {
        const { oscs, gain } = musicNodesRef.current;
        try {
          if (ctxRef.current) {
            gain.gain.linearRampToValueAtTime(0.0001, ctxRef.current.currentTime + 0.5);
            setTimeout(() => {
              oscs.forEach((o) => {
                try {
                  o.stop();
                  o.disconnect();
                } catch {}
              });
            }, 600);
          }
        } catch {}
        musicNodesRef.current = null;
      }
    };
  }, [musicEnabled, ctx]);

  const beep = useCallback(
    (freq = 880, duration = 0.1, type: OscillatorType = "sine", gain = 0.3) => {
      if (!enabled) return;
      try {
        const c = ctx();
        if (!c) return;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(gain, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + duration);
      } catch {}
    },
    [ctx, enabled]
  );

  const tick = useCallback(() => beep(1000, 0.08, "square", 0.2), [beep]);

  const reveal = useCallback(() => {
    if (!enabled) return;
    try {
      const c = ctx();
      if (!c) return;
      [523, 659, 784, 1046].forEach((f, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.value = f;
        g.gain.setValueAtTime(0, c.currentTime + i * 0.12);
        g.gain.linearRampToValueAtTime(0.25, c.currentTime + i * 0.12 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.3);
        osc.start(c.currentTime + i * 0.12);
        osc.stop(c.currentTime + i * 0.12 + 0.35);
      });
    } catch {}
  }, [ctx, enabled]);

  const complete = useCallback(() => {
    if (!enabled) return;
    try {
      const c = ctx();
      if (!c) return;
      const notes = [523, 659, 784, 1046, 784, 1046, 1318];
      notes.forEach((f, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.value = f;
        const t = c.currentTime + i * 0.15;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch {}
  }, [ctx, enabled]);

  const timerEnd = useCallback(() => beep(300, 0.5, "sawtooth", 0.4), [beep]);

  return { tick, reveal, complete, timerEnd };
}

