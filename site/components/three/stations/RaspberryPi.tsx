"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Project } from "@/content/projects";
import { useSite } from "@/lib/store";
import { THROTTLE_LEVEL, heatAt } from "@/lib/sim";
import { BlobShadow, FONT_MEDIUM, seededRandom, useHoverCursor, useStationClock } from "../util";

const COOL = new THREE.Color("#2f6bff");
const WARM = new THREE.Color("#ff9a3d");
const HOT = new THREE.Color("#ff2d1f");
const tmp = new THREE.Color();

function heatColor(h: number, out: THREE.Color) {
  // 0.55 → cool blue, throttle point → orange, 1 → red
  const k = THREE.MathUtils.clamp((h - 0.55) / (THROTTLE_LEVEL - 0.55), 0, 1);
  out.copy(COOL).lerp(WARM, k);
  if (h > THROTTLE_LEVEL) out.lerp(HOT, THREE.MathUtils.clamp((h - THROTTLE_LEVEL) / (1 - THROTTLE_LEVEL), 0, 1));
  return out;
}

function GpioHeader() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 20; c++) {
        o.position.set(-0.6 + c * 0.0635, 0.07, -0.48 + r * 0.0635);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <mesh position={[0.0035, 0.045, -0.448]}>
        <boxGeometry args={[1.29, 0.05, 0.13]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, 40]}>
        <boxGeometry args={[0.016, 0.1, 0.016]} />
        <meshStandardMaterial color="#d4b25a" metalness={0.9} roughness={0.25} />
      </instancedMesh>
    </group>
  );
}

const SHIMMER_COUNT = 14;

/** Soft white radial sprite for the heat shimmer. */
function makeSoftTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function RaspberryPiStation({ project }: { project: Project }) {
  const [x, , z] = project.station.position;
  const { t, near } = useStationClock(x);
  const hover = useHoverCursor();
  const set = useSite((s) => s.set);
  const order = useSite((s) => s.tdasOrder);
  const heat = useRef(0.62);
  const softTex = useMemo(() => makeSoftTexture(), []);
  useEffect(() => () => softTex.dispose(), [softTex]);

  const socMat = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.Mesh>(null);
  const fillMat = useRef<THREE.MeshBasicMaterial>(null);
  const bulbMat = useRef<THREE.MeshBasicMaterial>(null);
  const shimmer = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: SHIMMER_COUNT }, (_, i) => ({ phase: i / SHIMMER_COUNT, dx: (rand() - 0.5) * 0.22, dz: (rand() - 0.5) * 0.22 }));
  }, []);

  // Restart the batch loop when the order changes so the shape is visible.
  useEffect(() => {
    t.current = 0;
  }, [order, t]);

  const TUBE_H = 1.1;
  const TUBE_BASE = 0.18;

  useFrame((_, dt) => {
    if (!near.current) return;
    const target = heatAt(useSite.getState().tdasOrder, t.current);
    heat.current = THREE.MathUtils.damp(heat.current, target, 4, dt);
    const h = heat.current;
    heatColor(h, tmp);
    if (socMat.current) {
      socMat.current.emissive.copy(tmp);
      socMat.current.emissiveIntensity = 0.6 + Math.max(0, h - 0.55) * 6;
    }
    if (glow.current) {
      glow.current.color.copy(tmp);
      glow.current.intensity = 0.6 + Math.max(0, h - 0.55) * 8;
    }
    if (fill.current) {
      const level = THREE.MathUtils.clamp(h, 0.05, 1);
      fill.current.scale.y = level;
      fill.current.position.y = TUBE_BASE + (TUBE_H * level) / 2;
    }
    fillMat.current?.color.copy(tmp);
    bulbMat.current?.color.copy(tmp);

    // Heat shimmer: rises only when the chip is near/above the throttling point.
    const strength = THREE.MathUtils.clamp((h - (THROTTLE_LEVEL - 0.08)) * 5, 0, 1);
    shimmer.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i];
      const p = (t.current * 0.45 + s.phase) % 1;
      m.position.set(-0.15 + s.dx + Math.sin(t.current * 3 + i) * 0.03, 0.12 + p * 0.9, 0.05 + s.dz);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = strength * Math.sin(p * Math.PI) * 0.35;
      mat.color.copy(tmp);
      m.scale.setScalar(0.6 + p * 0.9);
    });
  });

  // Thermometer tick for the throttling point.
  const tickY = TUBE_BASE + TUBE_H * THROTTLE_LEVEL;

  return (
    <group position={[x, 0, z]}>
      <BlobShadow w={2.4} d={1.6} />
      <group
        rotation-y={-0.25}
        onClick={(e) => {
          e.stopPropagation();
          set({ panel: project.slug });
        }}
        {...hover}
      >
        {/* standoffs */}
        {[
          [-0.78, -0.48],
          [0.78, -0.48],
          [-0.78, 0.48],
          [0.78, 0.48],
        ].map(([sx, sz]) => (
          <mesh key={`${sx}${sz}`} position={[sx, 0.03, sz]}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 10]} />
            <meshStandardMaterial color="#c9c9c9" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
        {/* PCB */}
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[1.7, 0.03, 1.12]} />
          <meshStandardMaterial color="#1d6b3c" roughness={0.55} metalness={0.1} />
        </mesh>
        <group position={[0, 0.06, 0]}>
          <GpioHeader />
          {/* SoC: fanless, no heatsink */}
          <mesh position={[-0.15, 0.04, 0.05]}>
            <boxGeometry args={[0.3, 0.025, 0.3]} />
            <meshStandardMaterial ref={socMat} color="#2a2d33" metalness={0.6} roughness={0.35} emissive={COOL} emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
          {/* RAM */}
          <mesh position={[0.2, 0.035, 0.05]}>
            <boxGeometry args={[0.22, 0.02, 0.26]} />
            <meshStandardMaterial color="#141414" roughness={0.6} />
          </mesh>
          {/* USB stacks and Ethernet on the right edge */}
          {[0.28, -0.05].map((zz) => (
            <mesh key={zz} position={[0.72, 0.1, zz]}>
              <boxGeometry args={[0.32, 0.16, 0.26]} />
              <meshStandardMaterial color="#b8bcc4" metalness={0.9} roughness={0.25} />
            </mesh>
          ))}
          <mesh position={[0.72, 0.1, -0.36]}>
            <boxGeometry args={[0.32, 0.15, 0.3]} />
            <meshStandardMaterial color="#c4c8cf" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* micro-HDMI and USB-C on the front edge */}
          {[-0.62, -0.38, -0.16].map((xx, i) => (
            <mesh key={xx} position={[xx, 0.04, 0.52]}>
              <boxGeometry args={[i === 0 ? 0.16 : 0.12, 0.04, 0.1]} />
              <meshStandardMaterial color="#aeb2b9" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
        <pointLight ref={glow} position={[-0.15, 0.35, 0.1]} intensity={0.6} distance={1.8} decay={2} />

        {/* heat shimmer quads */}
        {seeds.map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              shimmer.current[i] = m;
            }}
          >
            <planeGeometry args={[0.22, 0.3]} />
            <meshBasicMaterial map={softTex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* thermometer */}
      <group position={[1.15, 0, -0.45]}>
        <BlobShadow w={0.5} d={0.5} />
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.06, 24]} />
          <meshStandardMaterial color="#1f232b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, TUBE_BASE + TUBE_H / 2, 0]}>
          <cylinderGeometry args={[0.045, 0.045, TUBE_H, 20, 1, true]} />
          <meshStandardMaterial color="#cfe3ff" transparent opacity={0.2} roughness={0.1} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <sphereGeometry args={[0.07, 20, 20]} />
          <meshBasicMaterial ref={bulbMat} color={COOL} toneMapped={false} />
        </mesh>
        <mesh ref={fill} position={[0, TUBE_BASE + TUBE_H / 4, 0]}>
          <cylinderGeometry args={[0.025, 0.025, TUBE_H, 12]} />
          <meshBasicMaterial ref={fillMat} color={COOL} toneMapped={false} />
        </mesh>
        <mesh position={[0, tickY, 0]}>
          <boxGeometry args={[0.24, 0.008, 0.008]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Text font={FONT_MEDIUM} fontSize={0.085} position={[0.16, tickY, 0]} anchorX="left" anchorY="middle" color="#e8ecf5">
          80.8 °C
        </Text>
        <Text font={FONT_MEDIUM} fontSize={0.055} position={[0.16, tickY - 0.09, 0]} anchorX="left" anchorY="middle" color="#8590a8">
          throttling point
        </Text>
      </group>

      {/* current order, engraved above the board */}
      <Text font={FONT_MEDIUM} fontSize={0.09} letterSpacing={0.12} position={[-0.2, 1.25, -0.3]} anchorX="center" color={project.accent}>
        {order.toUpperCase().replace("-", " ")}
      </Text>
    </group>
  );
}
