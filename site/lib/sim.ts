/**
 * Illustrative models behind the station animations.
 * These drive visuals only. Real, measured numbers live in the HTML panels
 * with their sources (master.md §2, "honesty rule").
 */
import type { JobOrder, SensorId } from "@/lib/store";

/** Length of one illustrative job-batch loop, in seconds. */
export const THERMAL_LOOP = 10;

/**
 * Normalised SoC heat (0 = cold, 1 = auto-stop) at loop time t for a job order.
 * The throttling point sits at THROTTLE_LEVEL.
 */
export const THROTTLE_LEVEL = 0.78;

export function heatAt(order: JobOrder, t: number): number {
  const x = (t % THERMAL_LOOP) / THERMAL_LOOP; // 0..1 through the batch
  const base = 0.62; // pre-heated start
  switch (order) {
    case "hot-first": {
      // All hot jobs up front: a sharp early peak past the throttle point.
      const peak = Math.exp(-Math.pow((x - 0.28) / 0.16, 2));
      return base + 0.3 * peak - 0.08 * x;
    }
    case "cool-first": {
      const peak = Math.exp(-Math.pow((x - 0.75) / 0.16, 2));
      return base - 0.06 + 0.24 * peak;
    }
    case "alternating":
      return base + 0.1 + 0.035 * Math.sin(x * Math.PI * 12);
    case "random": {
      const n =
        Math.sin(x * 37.1) * 0.5 + Math.sin(x * 91.7 + 1.3) * 0.3 + Math.sin(x * 13.3 + 2.1) * 0.2;
      return base + 0.1 + 0.07 * n;
    }
  }
}

export const sensorLabels: Record<SensorId, { name: string; part: string; signal: string }> = {
  hr: { name: "Heart rate", part: "MAX30102", signal: "PPG" },
  motion: { name: "Motion", part: "MPU6050", signal: "IMU" },
  gsr: { name: "Skin conductance", part: "GSR", signal: "EDA" },
};

const baseTrust: Record<SensorId, number> = { hr: 0.42, gsr: 0.36, motion: 0.22 };

/**
 * Adaptive Weighted Fusion, simplified for the illustration: an unplugged
 * channel's signal quality drops to ~0 and the remaining weights renormalise.
 */
export function fusionWeights(unplugged: Record<SensorId, boolean>): Record<SensorId, number> {
  const q = (id: SensorId) => (unplugged[id] ? 0.02 : 1);
  const raw = (Object.keys(baseTrust) as SensorId[]).map((id) => [id, baseTrust[id] * q(id)] as const);
  const sum = raw.reduce((a, [, v]) => a + v, 0) || 1;
  return Object.fromEntries(raw.map(([id, v]) => [id, v / sum])) as Record<SensorId, number>;
}

/** Confidence of the fused estimate (illustrative): drops gently per lost channel. */
export function fusionConfidence(unplugged: Record<SensorId, boolean>): number {
  const lost = Object.values(unplugged).filter(Boolean).length;
  return [0.92, 0.81, 0.64, 0.12][lost];
}
