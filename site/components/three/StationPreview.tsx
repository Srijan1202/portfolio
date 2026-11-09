"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { getProject, type StationObject } from "@/content/projects";
import { useSite } from "@/lib/store";
import { STATIONS } from "./stations";

/** Camera distance per object, sized so the whole station fits a square frame. */
const DIST: Record<StationObject, number> = { phone: 4.0, "raspberry-pi": 4.8, esp32: 4.6, "l1-l2-stack": 6.3 };

/** Slow side-to-side sway around the station. Frozen under reduced motion. */
function Sway({ target, d }: { target: THREE.Vector3; d: number }) {
  const t = useRef(0);
  useFrame((state, dt) => {
    if (!useSite.getState().reducedMotion) t.current += Math.min(dt, 0.1);
    const a = 0.35 + Math.sin(t.current * 0.3) * 0.3;
    state.camera.position.set(target.x + Math.sin(a) * d, target.y + d * 0.32, target.z + Math.cos(a) * d);
    state.camera.lookAt(target);
  });
  return null;
}

/** Same rule as the home scene's frame guard: over 70 ms a frame on average and the model turns off. */
function Guard({ onSlow }: { onSlow: () => void }) {
  const r = useRef({ frames: 0, last: 0, total: 0, samples: 0, done: false });
  useFrame(() => {
    const s = r.current;
    const now = performance.now();
    s.frames++;
    if (!s.done && s.frames > 8 && s.last) {
      s.total += now - s.last;
      s.samples++;
      if (s.samples >= 45 || (s.samples >= 3 && s.total > 2500)) {
        if (s.total / s.samples > 70) {
          s.done = true;
          onSlow();
        }
        s.total = 0;
        s.samples = 0;
      }
    }
    s.last = now;
  });
  return null;
}

export default function StationPreview({
  slug,
  active,
  onReady,
  onSlow,
}: {
  slug: string;
  /** False while scrolled out of view: rendering pauses. */
  active: boolean;
  onReady: () => void;
  onSlow: () => void;
}) {
  const project = getProject(slug);
  const target = useMemo(() => new THREE.Vector3(...(project?.station.cameraTarget ?? [0, 0, 0])), [project]);
  if (!project) return null;
  const Station = STATIONS[project.station.object];
  const [x] = project.station.position;

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 36, near: 0.1, far: 40, position: [x, 2, 5] }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        requestAnimationFrame(onReady);
      }}
    >
      {/* Brighter than the desk scene: there is no lamp here. */}
      <ambientLight intensity={0.45} color="#a9b8e6" />
      <hemisphereLight args={["#3a4d85", "#0a0f1c", 0.7]} />
      <directionalLight position={[x + 3, 5, 4]} intensity={1.1} color="#ffd9b0" />
      <directionalLight position={[x - 4, 3, -3]} intensity={0.4} color="#6d8cff" />
      <Suspense fallback={null}>
        <Station project={project} />
      </Suspense>
      <Sway target={target} d={DIST[project.station.object]} />
      <Guard onSlow={onSlow} />
    </Canvas>
  );
}
