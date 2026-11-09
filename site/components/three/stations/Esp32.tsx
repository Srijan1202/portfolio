"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Project } from "@/content/projects";
import { useSite, type SensorId } from "@/lib/store";
import { fusionWeights } from "@/lib/sim";
import { BlobShadow, useCanvasTexture, useHoverCursor, useStationClock } from "../util";

type V3 = [number, number, number];

const SENSORS: { id: SensorId; pos: V3; board: string; size: [number, number]; color: string }[] = [
  { id: "hr", pos: [0.05, 0, 0.12], board: "#5b2a86", size: [0.2, 0.18], color: "#ff5d73" },
  { id: "motion", pos: [0.42, 0, -0.14], board: "#1d4f91", size: [0.22, 0.16], color: "#7aa2ff" },
  { id: "gsr", pos: [0.78, 0, 0.12], board: "#2a2f3a", size: [0.22, 0.18], color: "#ffd166" },
];

const FUSION: V3 = [0.25, 1.25, -0.25];
const TRACE_POINTS = 70;

function signal(id: SensorId, t: number, s: number) {
  // s: 0 at sensor end → 1 at fusion node; waves travel up the trace.
  const tt = t * 1.6 - s * 3;
  if (id === "hr") {
    const beat = (tt * 1.2) % 1;
    return Math.exp(-Math.pow((beat - 0.2) / 0.04, 2)) * 1.0 - Math.exp(-Math.pow((beat - 0.28) / 0.04, 2)) * 0.35;
  }
  if (id === "motion") return Math.sin(tt * 4.2) * 0.35 + Math.sin(tt * 9.1) * 0.12;
  return Math.sin(tt * 0.9) * 0.45 + Math.sin(tt * 2.3) * 0.08;
}

function Breadboard() {
  const { tex, ctx, canvas } = useCanvasTexture(1024, 384);
  useEffect(() => {
    const g = ctx;
    g.fillStyle = "#ece8de";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#cfcabd";
    g.fillRect(0, canvas.height / 2 - 10, canvas.width, 20);
    g.fillStyle = "#4a4740";
    for (let c = 0; c < 60; c++)
      for (let r = 0; r < 14; r++) {
        if (r === 2 || r === 7 || r === 11) continue;
        g.fillRect(14 + c * 16.8, 18 + r * 25, 5, 5);
      }
    g.fillStyle = "#d4483b";
    g.fillRect(0, 6, canvas.width, 3);
    g.fillStyle = "#3a6fd8";
    g.fillRect(0, canvas.height - 9, canvas.width, 3);
    tex.needsUpdate = true;
  }, [ctx, canvas, tex]);
  return (
    <group>
      <mesh position={[0.3, 0.045, 0]}>
        <boxGeometry args={[2.1, 0.09, 0.78]} />
        <meshStandardMaterial color="#e6e2d6" roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.0905, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.08, 0.76]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Oled({ position, x }: { position: V3; x: number }) {
  const { tex, ctx, canvas } = useCanvasTexture(256, 128);
  const last = useRef("");
  const { t, near } = useStationClock(x);
  useFrame(() => {
    if (!near.current) return;
    const unplugged = useSite.getState().unplugged;
    const lost = Object.values(unplugged).filter(Boolean).length;
    const states = ["CALM", "FOCUSED", "STRESS ^"];
    const label = lost === 3 ? "NO SIGNAL" : states[Math.floor(t.current / 4) % states.length];
    const bpm = 68 + Math.round(Math.sin(t.current * 0.5) * 6);
    const key = `${label}${bpm}${unplugged.hr}${lost}`;
    if (key === last.current) return;
    last.current = key;
    const g = ctx;
    g.fillStyle = "#02060a";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#9fe8ff";
    g.font = "700 40px ui-monospace, Menlo, Consolas, monospace";
    g.fillText(label, 14, 56);
    g.font = "500 22px ui-monospace, Menlo, Consolas, monospace";
    g.fillText(unplugged.hr ? "HR --" : `HR ${bpm}`, 14, 100);
    g.fillText(`CH ${3 - lost}/3`, 150, 100);
    tex.needsUpdate = true;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.24]} />
        <meshStandardMaterial color="#1b3f7a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.112, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.28, 0.15]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Wire({ from, to, color, dim }: { from: V3; to: V3; color: string; dim: boolean }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.18 + a.distanceTo(b) * 0.15;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.008, 6, false);
  }, [from, to]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={dim ? "#4a4f5c" : color} roughness={0.5} />
    </mesh>
  );
}

function Sensor({ cfg, x }: { cfg: (typeof SENSORS)[number]; x: number }) {
  const hover = useHoverCursor();
  const toggle = useSite((s) => s.toggleSensor);
  const off = useSite((s) => s.unplugged[cfg.id]);
  const group = useRef<THREE.Group>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);
  const { t } = useStationClock(x);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.position.y = THREE.MathUtils.damp(g.position.y, off ? 0.2 : 0, 8, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, off ? 0.35 : 0, 8, dt);
    if (led.current) {
      // Heartbeat pulse on the MAX30102 LED (~72 bpm).
      const beat = (t.current * 1.2) % 1;
      const k = cfg.id === "hr" && !off ? 0.4 + Math.exp(-Math.pow((beat - 0.15) / 0.06, 2)) * 3 : off ? 0.05 : 1.2;
      led.current.color.set(cfg.color).multiplyScalar(k);
    }
  });
  return (
    <group position={cfg.pos}>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          toggle(cfg.id);
        }}
        {...hover}
      >
        {/* header pins */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[cfg.size[0] * 0.8, 0.05, 0.03]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0.155, 0]}>
          <boxGeometry args={[cfg.size[0], 0.018, cfg.size[1]]} />
          <meshStandardMaterial color={cfg.board} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.172, 0.02]}>
          <boxGeometry args={[0.07, 0.016, 0.07]} />
          <meshStandardMaterial color="#121212" roughness={0.4} />
        </mesh>
        <mesh position={[cfg.size[0] * 0.3, 0.172, -cfg.size[1] * 0.25]}>
          <sphereGeometry args={[0.014, 10, 10]} />
          <meshBasicMaterial ref={led} color={cfg.color} toneMapped={false} />
        </mesh>
        {/* invisible, larger hit target */}
        <mesh position={[0, 0.16, 0]} visible={false}>
          <boxGeometry args={[cfg.size[0] + 0.1, 0.2, cfg.size[1] + 0.1]} />
        </mesh>
      </group>
    </group>
  );
}

function Traces({ x }: { x: number }) {
  const { t, near } = useStationClock(x);
  const lines = useMemo(
    () =>
      SENSORS.map((s) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRACE_POINTS * 3), 3));
        const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(1.6), transparent: true, toneMapped: false });
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(s.pos[0], 0.3, s.pos[2]),
          new THREE.Vector3(s.pos[0], 0.8, s.pos[2]),
          new THREE.Vector3(FUSION[0], FUSION[1] - 0.45, FUSION[2]),
          new THREE.Vector3(...FUSION),
        );
        return { id: s.id, line: new THREE.Line(geo, mat), curve, color: s.color };
      }),
    [],
  );
  useEffect(
    () => () =>
      lines.forEach((l) => {
        l.line.geometry.dispose();
        (l.line.material as THREE.Material).dispose();
      }),
    [lines],
  );

  const node = useRef<THREE.MeshStandardMaterial>(null);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const p = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const side = new THREE.Vector3();

  useFrame((_, dt) => {
    if (!near.current) return;
    const unplugged = useSite.getState().unplugged;
    const w = fusionWeights(unplugged);
    lines.forEach(({ id, line, curve, color }) => {
      const off = unplugged[id];
      const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < TRACE_POINTS; i++) {
        const s = i / (TRACE_POINTS - 1);
        curve.getPoint(s, p);
        curve.getTangent(s, tan);
        side.set(-tan.y, tan.x, 0).normalize();
        const amp = 0.07 * Math.sin(s * Math.PI);
        const v = off ? (Math.random() - 0.5) * 2.2 : signal(id, t.current, s);
        p.addScaledVector(side, v * amp);
        attr.setXYZ(i, p.x, p.y, p.z);
      }
      attr.needsUpdate = true;
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, off ? 0.35 : 1, 6, dt);
      if (off) mat.color.set("#8a5560");
      else mat.color.set(color).multiplyScalar(1.6);
    });
    const lost = Object.values(unplugged).filter(Boolean).length;
    if (node.current) {
      const pulse = 1 + Math.sin(t.current * 3) * 0.15;
      node.current.emissiveIntensity = THREE.MathUtils.damp(node.current.emissiveIntensity, (2.4 - lost * 0.6) * pulse, 5, dt);
    }
    SENSORS.forEach((s, i) => {
      const b = bars.current[i];
      if (!b) return;
      b.scale.y = THREE.MathUtils.damp(b.scale.y, Math.max(w[s.id], 0.02), 6, dt);
      b.position.y = FUSION[1] - 0.2 + (b.scale.y * 0.5) / 2;
    });
  });

  return (
    <group>
      {lines.map((l) => (
        <primitive key={l.id} object={l.line} />
      ))}
      <mesh position={FUSION}>
        <icosahedronGeometry args={[0.09, 2]} />
        <meshStandardMaterial ref={node} color="#0b2b28" emissive="#19c3b1" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      {/* fusion weight bars beside the node */}
      {SENSORS.map((s, i) => (
        <mesh
          key={s.id}
          ref={(m) => {
            bars.current[i] = m;
          }}
          position={[FUSION[0] + 0.25 + i * 0.06, FUSION[1] - 0.1, FUSION[2]]}
        >
          <boxGeometry args={[0.035, 0.5, 0.035]} />
          <meshBasicMaterial color={new THREE.Color(s.color).multiplyScalar(1.3)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Esp32Station({ project }: { project: Project }) {
  const [x, , z] = project.station.position;
  const hover = useHoverCursor();
  const set = useSite((s) => s.set);
  const unplugged = useSite((s) => s.unplugged);
  const espPin: V3 = [-0.45, 0.16, 0];

  return (
    <group position={[x - 0.3, 0, z]}>
      <BlobShadow w={2.8} d={1.4} />
      <Breadboard />
      {/* ESP32 dev board */}
      <group
        position={[-0.45, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          set({ panel: project.slug });
        }}
        {...hover}
      >
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.58, 0.035, 0.28]} />
          <meshStandardMaterial color="#141820" roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 0.152, 0]}>
          <boxGeometry args={[0.3, 0.03, 0.2]} />
          <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0.24, 0.14, 0]}>
          <boxGeometry args={[0.07, 0.008, 0.2]} />
          <meshStandardMaterial color="#1d2430" />
        </mesh>
        <mesh position={[-0.27, 0.14, 0]}>
          <boxGeometry args={[0.06, 0.04, 0.09]} />
          <meshStandardMaterial color="#b0b4ba" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
      {SENSORS.map((s) => (
        <Sensor key={s.id} cfg={s} x={x} />
      ))}
      {SENSORS.map((s, i) => (
        <Wire key={s.id} from={espPin} to={[s.pos[0], 0.13, s.pos[2]]} color={["#e8524a", "#3fa7ff", "#f4c542"][i]} dim={unplugged[s.id]} />
      ))}
      <Oled position={[-0.45, 0, -0.27]} x={x} />
      {/* haptic motor coin */}
      <mesh position={[1.12, 0.11, -0.2]} rotation-x={-Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.9} roughness={0.3} />
      </mesh>
      <Traces x={x} />
    </group>
  );
}
