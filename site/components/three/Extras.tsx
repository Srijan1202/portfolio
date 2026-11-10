"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { profile } from "@/content/site";
import { useSite } from "@/lib/store";
import { play } from "@/lib/sound";
import { useHoverCursor } from "./util";

/**
 * How much daylight there is at the visitor's local time: 0 at night, 1 from
 * mid-morning to late afternoon, with an hour-long ramp at each end.
 */
export function daylightNow(): number {
  const d = new Date();
  const h = d.getHours() + d.getMinutes() / 60;
  const up = THREE.MathUtils.smoothstep(h, 6.5, 8.5);
  const down = 1 - THREE.MathUtils.smoothstep(h, 17, 19);
  return Math.min(up, down);
}

/** Sticky notes: one or two beside each station. Clicking one opens its story in the HTML layer. */
export function StickyNotes() {
  const hover = useHoverCursor();
  const set = useSite((s) => s.set);
  const placed = useMemo(() => {
    const perStation = new Map<string, number>();
    return notes.map((n) => {
      const p = projects.find((x) => x.slug === n.slug)!;
      const k = perStation.get(n.slug) ?? 0;
      perStation.set(n.slug, k + 1);
      // First note right of the station label, second one left of it.
      const side = k === 0 ? 1 : -1;
      return { n, pos: [p.station.position[0] + side * 1.05, 0.012, 0.78] as const, rot: side * 0.22 + k * 0.1 };
    });
  }, []);

  return (
    <>
      {placed.map(({ n, pos, rot }) => (
        <group key={n.id} position={pos} rotation-y={rot}>
          <mesh
            rotation-x={-Math.PI / 2}
            onClick={(e) => {
              e.stopPropagation();
              play("note");
              set({ note: n.id });
            }}
            {...hover}
          >
            <planeGeometry args={[0.3, 0.3]} />
            <meshStandardMaterial color="#f2d45c" roughness={0.9} emissive="#f2d45c" emissiveIntensity={0.12} />
          </mesh>
          {/* three "handwriting" lines */}
          {[0.07, 0, -0.07].map((z, i) => (
            <mesh key={z} position={[i === 2 ? -0.04 : 0, 0.002, -z]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[i === 2 ? 0.14 : 0.22, 0.014]} />
              <meshBasicMaterial color="#5a4a12" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/** A few puffs rising from the mug for a few seconds after `steam` changes. */
export function Steam() {
  const steam = useSite((s) => s.steam);
  const started = useRef(-1);
  const puffs = useRef<(THREE.Mesh | null)[]>([]);
  const clock = useRef(0);

  useEffect(() => {
    if (steam > 0) started.current = clock.current;
  }, [steam]);

  useFrame((_, dt) => {
    clock.current += Math.min(dt, 0.1);
    const age = started.current < 0 ? Infinity : clock.current - started.current;
    puffs.current.forEach((m, i) => {
      if (!m) return;
      const t = (age - i * 0.5) / 2.6; // each puff lives 2.6 s, staggered
      const live = age < 7 && t > 0;
      const u = live ? t % 1 : 0;
      m.visible = live;
      m.position.set(Math.sin(u * 5 + i) * 0.03, 0.34 + u * 0.5, 0);
      m.scale.setScalar(0.6 + u * 1.2);
      (m.material as THREE.MeshBasicMaterial).opacity = live ? 0.28 * Math.sin(u * Math.PI) : 0;
    });
  });

  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            puffs.current[i] = m;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color="#e8ecf5" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/** Photo mode: when `photoShot` changes, render one frame and download it with a small signature. */
export function PhotoTaker() {
  const shot = useSite((s) => s.photoShot);
  const { gl, scene, camera } = useThree();
  const last = useRef(0);

  useEffect(() => {
    if (shot === 0 || shot === last.current) return;
    last.current = shot;
    // Render and copy in the same task: the drawing buffer is cleared afterwards.
    gl.render(scene, camera);
    const src = gl.domElement;
    const out = document.createElement("canvas");
    out.width = src.width;
    out.height = src.height;
    const g = out.getContext("2d");
    if (!g) return;
    g.drawImage(src, 0, 0);
    const px = Math.max(14, Math.round(out.width / 70));
    g.font = `600 ${px}px system-ui, sans-serif`;
    g.textAlign = "right";
    g.fillStyle = "rgba(232,236,245,0.85)";
    g.fillText(`${profile.name} · srijansri.tech`, out.width - px, out.height - px);
    play("shutter");
    out.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "srijan-desk.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, "image/png");
  }, [shot, gl, scene, camera]);

  return null;
}
