"use client";

import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { getProject, type StationObject } from "@/content/projects";
import { useSite } from "@/lib/store";
import { STATIONS } from "./stations";
import { usePauseWhenHidden, useFrameGuard } from "./guard";

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

function Guard({ onSlow }: { onSlow: () => void }) {
  useFrameGuard(onSlow);
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
  // Pause while scrolled away, and while Next keeps the page hidden after navigation.
  const r3f = useRef<RootState | null>(null);
  usePauseWhenHidden(r3f, active ? "always" : "never");
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
      onCreated={(state) => {
        const { gl } = state;
        r3f.current = state;
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
