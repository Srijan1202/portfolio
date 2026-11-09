"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { projects } from "@/content/projects";
import { useSite } from "@/lib/store";
import { CameraRail } from "./CameraRail";
import { ContactTerminal, DeskSurface, HeroText, Lamp, StationLabel } from "./Desk";
import { PhoneStation } from "./stations/Phone";
import { RaspberryPiStation } from "./stations/RaspberryPi";
import { Esp32Station } from "./stations/Esp32";
import { L1L2StackStation } from "./stations/L1L2Stack";

const STATIONS = {
  phone: PhoneStation,
  "raspberry-pi": RaspberryPiStation,
  esp32: Esp32Station,
  "l1-l2-stack": L1L2StackStation,
} as const;

/**
 * Frame-rate guard. Skips the first frames (shader compilation), then
 * measures real frame time. Too slow on "high" → drop to "low". Still too
 * slow on "low" → turn the scene off; the HTML page is unaffected.
 */
function FrameGuard() {
  const ref = useRef({ frames: 0, last: 0, total: 0, samples: 0 });
  useFrame(() => {
    const r = ref.current;
    const now = performance.now();
    r.frames++;
    // Skip the first frames (shader compilation), then judge a window that
    // ends after 45 frames or 2.5 s, whichever comes first.
    if (r.frames > 8 && r.last) {
      r.total += now - r.last;
      r.samples++;
      if (r.samples >= 45 || (r.samples >= 3 && r.total > 2500)) {
        const avg = r.total / r.samples;
        const { quality, set } = useSite.getState();
        if (avg > 70) {
          // Hopeless (e.g. software rendering): skip the low-quality retry.
          if (quality === "high" && avg < 400) set({ quality: "low" });
          else set({ sceneTooSlow: true });
        }
        r.total = 0;
        r.samples = 0;
      }
    }
    r.last = now;
  });
  return null;
}

function Scene() {
  const quality = useSite((s) => s.quality);
  return (
    <>
      <color attach="background" args={["#0a0f1c"]} />
      <fog attach="fog" args={["#0a0f1c", 9, 26]} />

      {/* Lighting: one warm key (the lamp), a cool night fill, per-station accents. */}
      <ambientLight intensity={0.22} color="#8fa3d9" />
      <hemisphereLight args={["#2b3b6b", "#0a0f1c", 0.5]} />
      <directionalLight position={[6, 6, 5]} intensity={0.55} color="#ffd9b0" />
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
  const set = useSite((s) => s.set);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    set({ sceneActive: true });
    return () => set({ sceneActive: false, panel: null });
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
