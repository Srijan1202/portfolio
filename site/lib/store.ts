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
  /** Last lines of the Contact terminal, mirrored on the 3D screen ("$ " marks a command). */
  termScreen: string[];

  /** Desk lamp, toggled by clicking it or from the terminal. */
  lampOn: boolean;
  /** Bumped to make the mug steam (click it, or run "coffee" in the terminal). */
  steam: number;
  /** Sticky note currently open (id from content/notes.ts). */
  note: string | null;
  /** UI sounds. Off until the visitor turns them on. */
  sound: boolean;
  /** Photo mode: page content hidden so the desk can be captured. */
  photo: boolean;
  /** Bumped to save a photo of the desk. */
  photoShot: number;

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
  termScreen: [],
  lampOn: true,
  steam: 0,
  note: null,
  sound: false,
  photo: false,
  photoShot: 0,
  set: (partial) => set(partial),
  toggleSensor: (id) => set((s) => ({ unplugged: { ...s.unplugged, [id]: !s.unplugged[id] } })),
}));

/**
 * Scroll progress along the camera rail, as a float stop index.
 * Kept outside React state so the render loop can read it every frame
 * without re-rendering anything.
 */
export const rail = { progress: 0 };
