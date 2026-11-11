"use client";

import { useFrame, type RootState } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";

/**
 * Frame-rate guard shared by the home scene and the small header models.
 *
 * It only reacts to sustained slowness, never to a one-off stall:
 * - frames while the tab is hidden are ignored;
 * - a gap over 1 s between frames is a pause (tab switch, page hidden by
 *   navigation, shader compile), not slowness: the measurement restarts;
 * - the first 2 s after any (re)start are ignored while things warm up;
 * - a frame counts at most 250 ms, so one long stall can't dominate;
 * - two consecutive slow windows (about 5 s) are needed before `onSlow`.
 */
const PAUSE_MS = 1000;
const WARMUP_MS = 2000;
const WINDOW_MS = 2500;
const CLAMP_MS = 250;
const SLOW_MS = 70;

export function useFrameGuard(onSlow: (avgMs: number) => void) {
  const r = useRef({ last: 0, since: 0, total: 0, samples: 0, strikes: 0 });
  const cb = useRef(onSlow);
  useLayoutEffect(() => {
    cb.current = onSlow;
  });

  useFrame(() => {
    const s = r.current;
    const now = performance.now();
    const dt = s.last ? now - s.last : 0;
    s.last = now;
    if (document.hidden || !dt || dt > PAUSE_MS) {
      s.since = now;
      s.total = 0;
      s.samples = 0;
      return;
    }
    if (now - s.since < WARMUP_MS) return;
    s.total += Math.min(dt, CLAMP_MS);
    s.samples++;
    if (s.total < WINDOW_MS) return;
    const avg = s.total / s.samples;
    s.total = 0;
    s.samples = 0;
    s.strikes = avg > SLOW_MS ? s.strikes + 1 : 0;
    if (s.strikes >= 2) {
      s.strikes = 0;
      cb.current(avg);
    }
  });
}

/**
 * With Cache Components, Next hides pages with React's <Activity> instead of
 * unmounting them, and an R3F canvas keeps rendering while hidden. This stops
 * the render loop while the page is hidden and resumes it when it's shown.
 * Pass the R3F state captured in `onCreated`.
 */
export function usePauseWhenHidden(state: React.RefObject<RootState | null>, frameloop: "always" | "never" = "always") {
  useLayoutEffect(() => {
    state.current?.setFrameloop(frameloop);
    // Read the ref at hide time on purpose: the canvas may not exist yet when this effect first runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => state.current?.setFrameloop("never");
  }, [state, frameloop]);
}
