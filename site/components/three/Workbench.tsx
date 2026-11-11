"use client";

import { Canvas, type RootState } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { projects } from "@/content/projects";
import { useSite } from "@/lib/store";
import { play } from "@/lib/sound";
import { CameraRail } from "./CameraRail";
import { ContactTerminal, DeskSurface, HeroText, Lamp, StationLabel } from "./Desk";
import { STATIONS } from "./stations";
import { usePauseWhenHidden, useFrameGuard } from "./guard";
import { PhotoTaker, StickyNotes, daylightNow } from "./Extras";

/**
 * Frame-rate guard. Skips the first frames (shader compilation), then
 * measures real frame time. Too slow on "high" → drop to "low". Still too
 * slow on "low" → turn the scene off; the HTML page is unaffected.
 */
function FrameGuard() {
  useFrameGuard((avg) => {
    const { quality, set } = useSite.getState();
    // Hopeless (e.g. software rendering): skip the low-quality retry.
    if (quality === "high" && avg < 200) set({ quality: "low" });
    else set({ sceneTooSlow: true });
  });
  return null;
}

function Scene() {
  const quality = useSite((s) => s.quality);
  // Room light follows the visitor's local time: brighter and cooler by day.
  const [day] = useState(daylightNow);
  return (
    <>
      <color attach="background" args={["#0a0f1c"]} />
      <fog attach="fog" args={["#0a0f1c", 9, 26]} />

      {/* Lighting: one warm key (the lamp), a cool night fill, per-station accents. */}
      <ambientLight intensity={0.22 + 0.3 * day} color="#8fa3d9" />
      <hemisphereLight args={["#2b3b6b", "#0a0f1c", 0.5]} />
      <directionalLight position={[6, 6, 5]} intensity={0.55 + 0.6 * day} color={day > 0.5 ? "#fff1dc" : "#ffd9b0"} />
      <directionalLight position={[-8, 4, -2]} intensity={0.25} color="#6d8cff" />
      <Lamp quality={quality} />

      <DeskSurface />
      <HeroText />
      {projects.map((p, i) => {
        const Station = STATIONS[p.station.object];
        return (
          <group key={p.slug}>
            <Station project={p} />
            <StationLabel x={p.station.position[0]} index={i + 1} title={p.shortTitle} accent={p.accent} />
          </group>
        );
      })}
      <ContactTerminal />
      <StickyNotes />
      <PhotoTaker />

      <CameraRail />
      <FrameGuard />

      {quality === "high" && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
        </EffectComposer>
      )}
    </>
  );
}

export default function Workbench() {
  const quality = useSite((s) => s.quality);
  const stop = useSite((s) => s.activeStop);
  useEffect(() => {
    play("step");
  }, [stop]);
  const set = useSite((s) => s.set);
  const [visible, setVisible] = useState(false);
  // Stop rendering while Next keeps this page hidden after navigating away.
  const r3f = useRef<RootState | null>(null);
  usePauseWhenHidden(r3f);

  useEffect(() => {
    set({ sceneActive: true });
    // Switches on the scene-only layout (the `scene` CSS variants in globals.css).
    document.documentElement.dataset.scene = "on";
    return () => {
      set({ sceneActive: false, panel: null });
      delete document.documentElement.dataset.scene;
    };
  }, [set]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 transition-opacity duration-1000"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Canvas
        dpr={quality === "high" ? [1, 1.5] : [1, 1.25]}
        camera={{ fov: 38, near: 0.1, far: 60, position: [0, 1.6, 5] }}
        gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
        onCreated={(state) => {
          const { gl } = state;
          r3f.current = state;
          // Opt-in perf inspection: open the page with ?debug3d.
          if (window.location.search.includes("debug3d")) (window as unknown as { __r3f: unknown }).__r3f = state;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          // Fade in after the first frame so there is no flash of an empty canvas.
          requestAnimationFrame(() => setVisible(true));
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <AdaptiveDpr pixelated={false} />
      </Canvas>
    </div>
  );
}
