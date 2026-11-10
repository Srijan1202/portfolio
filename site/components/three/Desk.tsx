"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { profile } from "@/content/site";
import { useSite } from "@/lib/store";
import { play } from "@/lib/sound";
import { BlobShadow, FONT_BOLD, FONT_MEDIUM, roundRect, seededRandom, useCanvasTexture, useHoverCursor } from "./util";
import { Steam, daylightNow } from "./Extras";
import { CONTACT_X, HERO_X } from "./CameraRail";

const DESK_MIN = -5;
const DESK_MAX = 33;
const DESK_LEN = DESK_MAX - DESK_MIN;
const DESK_MID = (DESK_MIN + DESK_MAX) / 2;

export function DeskSurface() {
  // Subtle wood-grain / graphite noise drawn once into a texture.
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1a1f2a";
    g.fillRect(0, 0, c.width, c.height);
    const rand = seededRandom(7);
    for (let i = 0; i < 260; i++) {
      const y = rand() * c.height;
      g.strokeStyle = `rgba(${rand() > 0.5 ? "255,220,190" : "0,0,0"},${0.025 + rand() * 0.03})`;
      g.lineWidth = 0.5 + rand() * 1.5;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= c.width; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 2);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 1);
    return t;
  }, []);
  useEffect(() => () => map.dispose(), [map]);

  return (
    <group>
      {/* desk top, top face at y = 0 */}
      <mesh position={[DESK_MID, -0.06, 0]} receiveShadow>
        <boxGeometry args={[DESK_LEN, 0.12, 3.4]} />
        <meshStandardMaterial map={map} roughness={0.72} metalness={0.05} />
      </mesh>
      {/* front edge highlight */}
      <mesh position={[DESK_MID, -0.06, 1.701]}>
        <planeGeometry args={[DESK_LEN, 0.12]} />
        <meshStandardMaterial color="#2a3142" roughness={0.5} />
      </mesh>
      {/* wall */}
      <mesh position={[DESK_MID, 3, -2.2]} receiveShadow>
        <planeGeometry args={[DESK_LEN + 20, 8]} />
        <meshStandardMaterial color="#0f1628" roughness={0.95} />
      </mesh>
      {/* pegboard strip behind the stations */}
      <Pegboard />
    </group>
  );
}

function Pegboard() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cols = 150;
  const rows = 5;
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        o.position.set(DESK_MIN + 1 + c * 0.24, 1.0 + r * 0.24, -2.19);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cols * rows]}>
      <circleGeometry args={[0.022, 8]} />
      <meshBasicMaterial color="#070b16" />
    </instancedMesh>
  );
}

export function Lamp({ quality }: { quality: "high" | "low" }) {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const on = useSite((s) => s.lampOn);
  const set = useSite((s) => s.set);
  const hover = useHoverCursor();
  // The lamp matters less in daytime, when the room light is up.
  const day = useMemo(() => daylightNow(), []);
  useEffect(() => {
    target.position.set(HERO_X + 0.2, 0, 0.2);
    if (spot.current) spot.current.target = target;
  }, [target]);

  const base: [number, number, number] = [HERO_X - 2.6, 0, -0.9];
  return (
    <group>
      <primitive object={target} />
      <group position={base}>
        <BlobShadow w={1} d={0.8} />
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.06, 32]} />
          <meshStandardMaterial color="#22252c" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* lower arm */}
        <mesh position={[0.18, 0.62, 0.15]} rotation={[0.25, 0, -0.32]}>
          <cylinderGeometry args={[0.025, 0.025, 1.25, 12]} />
          <meshStandardMaterial color="#2c3038" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* upper arm */}
        <mesh position={[0.78, 1.34, 0.42]} rotation={[0.2, 0, -1.15]}>
          <cylinderGeometry args={[0.022, 0.022, 1.1, 12]} />
          <meshStandardMaterial color="#2c3038" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* joint */}
        <mesh position={[0.4, 1.2, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#3a3f48" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* head */}
        {/* Click the lamp head to switch it. */}
        <group
          position={[1.3, 1.5, 0.55]}
          rotation={[-0.25, 0, 0.8]}
          onClick={(e) => {
            e.stopPropagation();
            play("click");
            set({ lampOn: !on });
          }}
          {...hover}
        >
          <mesh>
            <coneGeometry args={[0.26, 0.38, 32, 1, true]} />
            <meshStandardMaterial color="#2a2d33" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color={on ? [4, 2.6, 1.4] : [0.25, 0.22, 0.2]} toneMapped={false} />
          </mesh>
        </group>
        <spotLight
          ref={spot}
          position={[1.3, 1.45, 0.55]}
          color="#ffc58a"
          intensity={on ? (quality === "high" ? 28 : 20) * (1 - 0.35 * day) : 0}
          angle={0.85}
          penumbra={0.75}
          distance={9}
          decay={1.6}
        />
      </group>
    </group>
  );
}

export function HeroText() {
  // On portrait screens the HTML hero sits on top of this lettering, so leave it out.
  const portrait = useThree((s) => s.size.width / Math.max(s.size.height, 1) < 1.1);
  return (
    <group position={[HERO_X, 0, 0.1]}>
      {!portrait && (
      <>
      <Text
        font={FONT_BOLD}
        fontSize={0.34}
        letterSpacing={-0.02}
        anchorX="center"
        anchorY="bottom"
        position={[0.2, 0.02, 0]}
        color="#f4efe6"
        outlineWidth={0}
      >
        {profile.name}
        <meshStandardMaterial color="#f4efe6" emissive="#ffcf9e" emissiveIntensity={0.35} roughness={0.4} metalness={0.1} />
      </Text>
      <Text
        font={FONT_MEDIUM}
        fontSize={0.12}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="top"
        position={[0.2, 0.004, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#ffb86b"
      >
        FULL-STACK · EMBEDDED · CAREFUL EXPERIMENTS
      </Text>
      </>
      )}
      {/* scroll hint arrow on the desk */}
      <ScrollHint />
      <Mug position={[2.5, 0, -0.5]} />
    </group>
  );
}

function ScrollHint() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = 2.0 + Math.sin(clock.elapsedTime * 2) * 0.06;
  });
  return (
    <mesh ref={ref} position={[2.0, 0.005, 0.9]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.06, 0.14, 3]} />
      <meshBasicMaterial color="#ffb86b" transparent opacity={0.6} />
    </mesh>
  );
}

function Mug({ position }: { position: [number, number, number] }) {
  const hover = useHoverCursor();
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        useSite.getState().set({ steam: useSite.getState().steam + 1 });
      }}
      {...hover}
    >
      <BlobShadow w={0.6} d={0.6} />
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.13, 0.12, 0.34, 32, 1, true]} />
        <meshStandardMaterial color="#d9d4ca" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.2} />
      </mesh>
      <mesh position={[0.15, 0.18, 0]}>
        <torusGeometry args={[0.07, 0.018, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#d9d4ca" roughness={0.5} />
      </mesh>
      <Steam />
    </group>
  );
}

/** Shown until the visitor types something into the HTML terminal. */
const IDLE_SCREEN = [
  "$ whoami",
  "srijan srivastava",
  "$ contact --all",
  "email    srijan.srivastava1202",
  "         @gmail.com",
  "github   srijan1202",
  "linkedin srijansrivastava1202",
  "$ type `help` on the card_",
];

/** End-of-desk contact station: a small terminal that mirrors the HTML one on the Contact card. */
export function ContactTerminal() {
  const { tex, ctx, canvas } = useCanvasTexture(512, 320);
  const screen = useSite((s) => s.termScreen);
  useEffect(() => {
    const g = ctx;
    g.fillStyle = "#07110d";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.font = "600 22px ui-monospace, Menlo, Consolas, monospace";
    const lines = (screen.length ? screen : IDLE_SCREEN).slice(-8);
    lines.forEach((l, i) => {
      const cmd = l.startsWith("$ ");
      g.fillStyle = cmd ? "#7ee2a8" : "#d6f5e3";
      // ~35 monospace characters fit across the screen.
      g.fillText(l.length > 35 ? `${l.slice(0, 34)}…` : l, 24, 42 + i * 36);
    });
    tex.needsUpdate = true;
  }, [ctx, canvas, tex, screen]);

  return (
    <group position={[CONTACT_X + 0.4, 0, -0.1]} rotation-y={-0.35}>
      <BlobShadow w={2.2} d={1.6} />
      {/* base */}
      <mesh position={[0, 0.03, 0.25]}>
        <boxGeometry args={[1.5, 0.06, 1.0]} />
        <meshStandardMaterial color="#20242c" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* keyboard area */}
      <mesh position={[0, 0.062, 0.3]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.3, 0.55]} />
        <meshStandardMaterial color="#14171d" roughness={0.8} />
      </mesh>
      {/* screen */}
      <group position={[0, 0.06, -0.25]} rotation-x={-0.22}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[1.5, 0.96, 0.04]} />
          <meshStandardMaterial color="#20242c" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.48, 0.021]}>
          <planeGeometry args={[1.38, 0.86]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      {/* notebook */}
      <group position={[-1.35, 0, 0.35]} rotation-y={0.25}>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.7, 0.05, 0.95]} />
          <meshStandardMaterial color="#c2552f" roughness={0.8} />
        </mesh>
        <mesh position={[0.18, 0.06, 0]} rotation={[0, 0.4, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
          <meshStandardMaterial color="#e8e2d6" />
        </mesh>
      </group>
    </group>
  );
}

/** Small engraved label on the desk in front of each station. */
export function StationLabel({
  x,
  index,
  title,
  accent,
}: {
  x: number;
  index: number;
  title: string;
  accent: string;
}) {
  const { tex, ctx, canvas } = useCanvasTexture(512, 96);
  useEffect(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    roundRect(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 14);
    ctx.fillStyle = "rgba(10,15,28,0.85)";
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = "600 30px ui-monospace, Menlo, Consolas, monospace";
    ctx.fillText(`0${index}`, 28, 60);
    ctx.fillStyle = "#e8ecf5";
    ctx.font = "600 34px system-ui, sans-serif";
    ctx.fillText(title, 92, 61);
    tex.needsUpdate = true;
  }, [ctx, canvas, tex, accent, index, title]);
  return (
    <mesh position={[x - 0.2, 0.004, 1.05]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1.2, 0.225]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}
