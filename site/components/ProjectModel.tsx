"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSite } from "@/lib/store";
import { hasWebGL, isLowEnd, readPref, sessionSlowFlag } from "@/lib/webgl";

// Loads only on the client, after the page has painted.
const StationPreview = dynamic(() => import("@/components/three/StationPreview"), { ssr: false });

/**
 * Small 3D model of the project's station, beside the page title.
 * Follows the same rules as the home scene: off if the visitor turned 3D off,
 * if this session was flagged slow, on low-end devices and without WebGL.
 * Desktop and tablet only; the space shows a soft accent glow either way.
 */
export function ProjectModel({ slug, accent }: { slug: string; accent: string }) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useSite.getState().set({ reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    const pref = readPref();
    const ok =
      window.matchMedia("(min-width: 768px)").matches &&
      pref !== "off" &&
      !(pref !== "on" && sessionSlowFlag()) &&
      !(pref !== "on" && isLowEnd()) &&
      hasWebGL();
    // Needs browser-only APIs, so it runs after mount by design.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(ok);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} aria-hidden className="relative hidden aspect-square w-full md:block">
      <div
        className="absolute inset-[14%] rounded-full blur-2xl"
        style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 30%, transparent), transparent)` }}
      />
      {on && (
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <StationPreview
            slug={slug}
            active={inView}
            onReady={() => setReady(true)}
            onSlow={() => {
              sessionSlowFlag(true);
              setOn(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
