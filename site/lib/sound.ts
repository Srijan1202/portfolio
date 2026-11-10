"use client";

import { useSite } from "@/lib/store";

/**
 * Tiny synthesised UI sounds (no audio files). Silent unless the visitor has
 * turned sound on; the audio context is only created at that point.
 */

let ctx: AudioContext | null = null;

const TONES = {
  step: { freq: 520, to: 780, dur: 0.12, gain: 0.05 }, // arriving at a station
  click: { freq: 220, to: 160, dur: 0.06, gain: 0.08 }, // lamp switch
  key: { freq: 900, to: 700, dur: 0.03, gain: 0.03 }, // terminal enter
  note: { freq: 660, to: 990, dur: 0.18, gain: 0.05 }, // found a sticky note
  shutter: { freq: 1400, to: 300, dur: 0.09, gain: 0.07 }, // photo
} as const;

export function play(kind: keyof typeof TONES) {
  if (!useSite.getState().sound) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = TONES[kind];
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(t.freq, now);
    osc.frequency.exponentialRampToValueAtTime(t.to, now + t.dur);
    gain.gain.setValueAtTime(t.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + t.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + t.dur + 0.02);
  } catch {
    /* audio unavailable: stay silent */
  }
}
