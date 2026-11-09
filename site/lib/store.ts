"use client";

import { create } from "zustand";

export type JobOrder = "hot-first" | "cool-first" | "alternating" | "random";
export type SensorId = "hr" | "motion" | "gsr";
export type FitosFeature = "Training" | "Nutrition" | "Running" | "AI Coach";
export type Quality = "high" | "low";

type State = {
  /** True once the 3D canvas is mounted; HTML-only controls hide otherwise. */
  sceneActive: boolean;
  /** Set by the frame-rate guard when even the low-quality scene is too slow. */
  sceneTooSlow: boolean;
  quality: Quality;
  reducedMotion: boolean;
  /** Nearest rail stop (0 hero … 4 L2, 5 overview, 6 contact). */
  activeStop: number;
  /** Project panel opened by clicking a 3D object. */
  panel: string | null;

  fitosFeature: FitosFeature | null;
  tdasOrder: JobOrder;
  unplugged: Record<SensorId, boolean>;
  sequencerOffline: boolean;

  set: (partial: Partial<Omit<State, "set" | "toggleSensor">>) => void;
  toggleSensor: (id: SensorId) => void;
};

export const useSite = create<State>((set) => ({
  sceneActive: false,
  sceneTooSlow: false,
  quality: "high",
  reducedMotion: false,
  activeStop: 0,
  panel: null,
  fitosFeature: null,
  tdasOrder: "hot-first",
  unplugged: { hr: false, motion: false, gsr: false },
  sequencerOffline: false,
  set: (partial) => set(partial),
  toggleSensor: (id) => set((s) => ({ unplugged: { ...s.unplugged, [id]: !s.unplugged[id] } })),
}));

/**
 * Scroll progress along the camera rail, as a float stop index.
 * Kept outside React state so the render loop can read it every frame
 * without re-rendering anything.
 */
export const rail = { progress: 0 };
