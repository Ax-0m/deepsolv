"use client";

let ctxSingleton: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctxSingleton) return ctxSingleton;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  try {
    ctxSingleton = new AC();
    return ctxSingleton;
  } catch {
    return null;
  }
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

function playTone(ctx: AudioContext, opts: ToneOptions) {
  const start = ctx.currentTime + (opts.delay ?? 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type ?? "square";
  osc.frequency.setValueAtTime(opts.freq, start);
  const peak = opts.gain ?? 0.06;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + opts.duration + 0.02);
}

function playSequence(tones: ToneOptions[]) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  let cursor = 0;
  for (const tone of tones) {
    playTone(ctx, { ...tone, delay: cursor + (tone.delay ?? 0) });
    cursor += tone.duration;
  }
}

export const Sounds = {
  click() {
    playSequence([{ freq: 880, duration: 0.04, type: "square", gain: 0.05 }]);
  },
  hover() {
    playSequence([{ freq: 1320, duration: 0.025, type: "square", gain: 0.025 }]);
  },
  catch() {
    playSequence([
      { freq: 660, duration: 0.07, type: "square", gain: 0.06 },
      { freq: 880, duration: 0.07, type: "square", gain: 0.06 },
      { freq: 1320, duration: 0.12, type: "square", gain: 0.07 },
    ]);
  },
  release() {
    playSequence([
      { freq: 660, duration: 0.06, type: "triangle", gain: 0.05 },
      { freq: 440, duration: 0.1, type: "triangle", gain: 0.05 },
    ]);
  },
  open() {
    playSequence([
      { freq: 440, duration: 0.05, type: "square", gain: 0.04 },
      { freq: 660, duration: 0.05, type: "square", gain: 0.04 },
      { freq: 880, duration: 0.08, type: "square", gain: 0.05 },
    ]);
  },
  error() {
    playSequence([
      { freq: 220, duration: 0.08, type: "sawtooth", gain: 0.05 },
      { freq: 165, duration: 0.14, type: "sawtooth", gain: 0.05 },
    ]);
  },
};

export type SoundName = keyof typeof Sounds;
