"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Project } from "@/content/projects";
import { useSite } from "@/lib/store";
import { BlobShadow, FONT_MEDIUM, useHoverCursor, useStationClock } from "../util";

type V3 = [number, number, number];

const L1Y = 0.17;
const L2Y = 0.98;
const SEQ_X = -1.45;
const LANE_Z = 0.22;

type Seg = { to: V3; dur: number; flash?: boolean };

const START: V3 = [-2.35, L2Y, LANE_Z];

/** Normal path: through the sequencer straight into an L2 block. */
const ONLINE: Seg[] = [
  { to: [SEQ_X, L2Y, LANE_Z], dur: 0.9 },
  { to: [0.95, L2Y, LANE_Z], dur: 1.3, flash: true },
  { to: [0.95, L2Y, LANE_Z], dur: 0.5 },
];

/** Escape hatch: blocked at the sequencer, drop to L1, wait, force-include. */
const OFFLINE: Seg[] = [
  { to: [SEQ_X - 0.28, L2Y, LANE_Z], dur: 0.8 },
  { to: [SEQ_X - 0.45, L2Y, LANE_Z], dur: 0.3 },
  { to: [SEQ_X, L1Y + 0.28, LANE_Z + 0.2], dur: 0.9 },
  { to: [0.25, L1Y + 0.28, LANE_Z + 0.2], dur: 1.8 },
  { to: [0.25, L1Y + 0.28, LANE_Z + 0.2], dur: 1.1 },
  { to: [0.25, L2Y, LANE_Z], dur: 0.9, flash: true },
  { to: [0.95, L2Y, LANE_Z], dur: 0.7 },
  { to: [0.95, L2Y, LANE_Z], dur: 0.5 },
];

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function samplePath(segs: Seg[], time: number, out: THREE.Vector3) {
  const total = segs.reduce((a, s) => a + s.dur, 0);
  let t = time % total;
  let from = START;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (t <= s.dur) {
      const k = ease(t / s.dur);
      out.set(from[0] + (s.to[0] - from[0]) * k, from[1] + (s.to[1] - from[1]) * k, from[2] + (s.to[2] - from[2]) * k);
      const isLast = i === segs.length - 1;
      return { fade: isLast ? 1 - t / s.dur : Math.min(1, time % total / 0.25), flashing: !!s.flash && k > 0.85, segment: i };
    }
    t -= s.dur;
    from = s.to;
  }
  out.set(...from);
  return { fade: 0, flashing: false, segment: segs.length - 1 };
}

function Chain({ y, count, size, z, color, emissive }: { y: number; count: number; size: number; z: number; color: string; emissive: string }) {
  const gap = 0.12;
  const span = count * size + (count - 1) * gap;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const x = -span / 2 + size / 2 + i * (size + gap);
        return (
          <group key={i}>
            <mesh position={[x, y, z]}>
              <boxGeometry args={[size, size, size]} />
              <meshStandardMaterial color={color} roughness={0.35} metalness={0.3} emissive={emissive} emissiveIntensity={0.25} />
            </mesh>
            {i < count - 1 && (
              <mesh position={[x + size / 2 + gap / 2, y, z]} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[0.012, 0.012, gap, 8]} />
                <meshBasicMaterial color={emissive} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function L1L2StackStation({ project }: { project: Project }) {
  const [x, , z] = project.station.position;
  const { t, near } = useStationClock(x);
  const hover = useHoverCursor();
  const set = useSite((s) => s.set);
  const offline = useSite((s) => s.sequencerOffline);

  const capsule = useRef<THREE.Mesh>(null);
  const capsuleMat = useRef<THREE.MeshStandardMaterial>(null);
  const flashBlock = useRef<THREE.MeshStandardMaterial>(null);
  const gateMat = useRef<THREE.MeshStandardMaterial>(null);
  const barrier = useRef<THREE.Mesh>(null);
  const inbox = useRef<THREE.MeshStandardMaterial>(null);
  const pos = new THREE.Vector3();

  useEffect(() => {
    t.current = 0;
  }, [offline, t]);

  const green = new THREE.Color("#3ddc97");
  const red = new THREE.Color("#ff5d73");

  useFrame((_, dt) => {
    if (!near.current) return;
    const isOff = useSite.getState().sequencerOffline;
    const r = samplePath(isOff ? OFFLINE : ONLINE, t.current, pos);
    if (capsule.current) {
      capsule.current.position.copy(pos);
      capsule.current.rotation.z = Math.PI / 2;
      capsule.current.scale.setScalar(Math.max(0.001, r.fade));
    }
    if (capsuleMat.current) {
      // Pulse while waiting out the delay window on L1.
      const waiting = isOff && r.segment === 4;
      capsuleMat.current.emissiveIntensity = waiting ? 1.5 + Math.sin(t.current * 10) * 1.2 : 2.2;
    }
    if (flashBlock.current) {
      flashBlock.current.emissiveIntensity = THREE.MathUtils.damp(flashBlock.current.emissiveIntensity, r.flashing ? 3 : 0.25, 10, dt);
    }
    if (inbox.current) {
      const active = isOff && r.segment >= 2 && r.segment <= 4;
      inbox.current.emissiveIntensity = THREE.MathUtils.damp(inbox.current.emissiveIntensity, active ? 2.2 : 0.3, 6, dt);
    }
    const c = isOff ? red : green;
    gateMat.current?.emissive.lerp(c, 0.2);
    if (barrier.current) {
      const s = THREE.MathUtils.damp(barrier.current.scale.y, isOff ? 1 : 0.001, 8, dt);
      barrier.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <BlobShadow w={3.6} d={1.6} />
      <group
        onClick={(e) => {
          e.stopPropagation();
          set({ panel: project.slug });
        }}
        {...hover}
      >
        {/* L1 chain on the desk */}
        <Chain y={L1Y} count={6} size={0.3} z={0.05} color="#2a3352" emissive="#6f7fb8" />
        {/* L1 inbox block (where forced txs land) */}
        <mesh position={[SEQ_X, L1Y, LANE_Z + 0.2]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial ref={inbox} color="#2a2f45" emissive={project.accent} emissiveIntensity={0.3} toneMapped={false} />
        </mesh>

        {/* L2 glass slab on pillars */}
        {[
          [-1.15, -0.25],
          [1.15, -0.25],
          [-1.15, 0.45],
          [1.15, 0.45],
        ].map(([px, pz]) => (
          <mesh key={`${px}${pz}`} position={[px, (L2Y - 0.2) / 2, pz]}>
            <cylinderGeometry args={[0.015, 0.015, L2Y - 0.2, 8]} />
            <meshStandardMaterial color="#5a5f75" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, L2Y - 0.19, 0.1]}>
          <boxGeometry args={[2.5, 0.025, 0.9]} />
          <meshStandardMaterial color="#9b6bff" transparent opacity={0.18} roughness={0.2} metalness={0} depthWrite={false} />
        </mesh>
        <mesh position={[0, L2Y - 0.19, 0.551]}>
          <boxGeometry args={[2.5, 0.028, 0.006]} />
          <meshBasicMaterial color={new THREE.Color(project.accent).multiplyScalar(1.5)} toneMapped={false} />
        </mesh>

        {/* two L2 lanes: OP Sepolia (front) and Arbitrum Sepolia (back) */}
        <Chain y={L2Y - 0.07} count={4} size={0.2} z={LANE_Z} color="#3a2d66" emissive="#b493ff" />
        <Chain y={L2Y - 0.07} count={4} size={0.2} z={-0.12} color="#2d2a55" emissive="#8b7bff" />
        {/* arrival block that flashes on inclusion */}
        <mesh position={[1.0, L2Y - 0.07, LANE_Z]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial ref={flashBlock} color="#3a2d66" emissive={project.accent} emissiveIntensity={0.25} toneMapped={false} />
        </mesh>

        {/* sequencer gate */}
        <group position={[SEQ_X, L2Y, LANE_Z]}>
          <mesh rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.16, 0.022, 12, 40]} />
            <meshStandardMaterial ref={gateMat} color="#1a1f2a" emissive="#3ddc97" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <mesh ref={barrier} rotation-y={Math.PI / 2} scale={[0.001, 0.001, 1]}>
            <circleGeometry args={[0.15, 32]} />
            <meshBasicMaterial color="#ff5d73" transparent opacity={0.35} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* transaction capsule */}
      <mesh ref={capsule} position={START}>
        <capsuleGeometry args={[0.045, 0.1, 6, 12]} />
        <meshStandardMaterial ref={capsuleMat} color="#ffffff" emissive={project.accent} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>

      {/* labels */}
      <Text font={FONT_MEDIUM} fontSize={0.075} letterSpacing={0.1} position={[0, 0.004, 0.62]} rotation-x={-Math.PI / 2} color="#a3adc2" anchorX="center">
        L1 · ETHEREUM SEPOLIA
      </Text>
      <Text font={FONT_MEDIUM} fontSize={0.065} letterSpacing={0.1} position={[0, L2Y - 0.15, 0.56]} color="#d9ccff" anchorX="center" anchorY="top">
        L2 · OP SEPOLIA (FRONT) · ARBITRUM SEPOLIA (BACK)
      </Text>
      <Text font={FONT_MEDIUM} fontSize={0.06} letterSpacing={0.12} position={[SEQ_X, L2Y + 0.24, LANE_Z]} color={offline ? "#ff9aa9" : "#9af0c6"} anchorX="center">
        {offline ? "SEQUENCER OFFLINE" : "SEQUENCER"}
      </Text>
    </group>
  );
}
