"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSite, type Quality } from "@/lib/store";
import { hasWebGL, isLowEnd, isSmallScreen, readPref, sessionSlowFlag as sessionFlag, writePref } from "@/lib/webgl";

// The 3D bundle loads only on the client, after the HTML has painted.
const Workbench = dynamic(() => import("@/components/three/Workbench"), { ssr: false });

type Verdict =
  | { mode: "pending" }
  | { mode: "off"; reason: "no-webgl" | "low-end" | "user" | "slow" }
  | { mode: "on"; quality: Quality };

function decide(): Verdict {
  const pref = readPref();
  if (pref === "off") return { mode: "off", reason: "user" };
  if (pref !== "on" && sessionFlag()) return { mode: "off", reason: "slow" };
  if (!hasWebGL()) return { mode: "off", reason: "no-webgl" };
  const lowEnd = isLowEnd();
  if (lowEnd && pref !== "on") return { mode: "off", reason: "low-end" };
  return { mode: "on", quality: isSmallScreen() || lowEnd ? "low" : "high" };
}

/**
 * Decides whether to run the 3D workbench: needs WebGL, skips low-end devices,
 * respects a saved user preference, and uses a lighter scene on phones.
 * The page content is plain HTML either way.
 */
export function WebGLGate() {
  const [verdict, setVerdict] = useState<Verdict>({ mode: "pending" });
  const set = useSite((s) => s.set);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => set({ reducedMotion: mq.matches });
    applyMotion();
    mq.addEventListener("change", applyMotion);
    // Deciding needs browser-only APIs, so it runs after mount by design.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerdict(decide());
    return () => mq.removeEventListener("change", applyMotion);
  }, [set]);

  // The frame-rate guard inside the scene reports "too slow" here.
  const tooSlow = useSite((s) => s.sceneTooSlow);
  // A manual "on" click in this visit overrides the guard.
  const forcedRef = useRef(false);
  useEffect(() => {
    if (!tooSlow || forcedRef.current) return;
    sessionFlag(true);
    setVerdict({ mode: "off", reason: "slow" });
  }, [tooSlow]);

  useEffect(() => {
    if (verdict.mode === "on") set({ quality: verdict.quality });
    if (verdict.mode !== "on") set({ sceneActive: false });
  }, [verdict, set]);

  const toggle = () => {
    if (verdict.mode === "on") {
      writePref("off");
      setVerdict({ mode: "off", reason: "user" });
    } else {
      writePref("on");
      forcedRef.current = true;
      sessionFlag(false);
      set({ sceneTooSlow: false });
      setVerdict(hasWebGL() ? { mode: "on", quality: isSmallScreen() ? "low" : "high" } : { mode: "off", reason: "no-webgl" });
    }
  };

  return (
    <>
      {verdict.mode === "on" && <Workbench />}
      {verdict.mode !== "pending" && (
        <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex items-center gap-2 text-xs">
          {verdict.mode === "off" && verdict.reason === "no-webgl" && (
            <span className="glass rounded-md px-2.5 py-1.5 text-dim">
              3D needs WebGL. <Link href="/lite" className="underline">2D version</Link>
            </span>
          )}
          {verdict.mode === "off" && verdict.reason === "slow" && (
            <span className="glass hidden rounded-md px-2.5 py-1.5 text-dim sm:inline-block">3D paused: this device was rendering it slowly.</span>
          )}
          {!(verdict.mode === "off" && verdict.reason === "no-webgl") && (
            <button
              type="button"
              onClick={toggle}
              aria-pressed={verdict.mode === "on"}
              className="glass rounded-md px-2.5 py-1.5 text-dim transition-colors hover:text-text"
            >
              3D scene: {verdict.mode === "on" ? "on" : "off"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
