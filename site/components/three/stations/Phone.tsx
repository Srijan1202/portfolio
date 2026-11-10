"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Project } from "@/content/projects";
import { useSite, type FitosFeature } from "@/lib/store";
import { BlobShadow, roundRect, useCanvasTexture, useHoverCursor, useStationClock } from "../util";

const FEATURES: FitosFeature[] = ["Training", "Nutrition", "Running", "AI Coach"];

/**
 * Stylised app screens drawn in code, used for features without a real
 * screenshot (see SCREENSHOTS below).
 */
function drawScreen(g: CanvasRenderingContext2D, w: number, h: number, feature: FitosFeature, accent: string) {
  g.fillStyle = "#0b0f19";
  g.fillRect(0, 0, w, h);
  // status bar
  g.fillStyle = "#8a93a8";
  g.font = "500 18px system-ui, sans-serif";
  g.fillText("9:41", 24, 34);
  g.fillRect(w - 64, 22, 36, 14);
  // header
  g.fillStyle = "#e8ecf5";
  g.font = "700 38px system-ui, sans-serif";
  g.fillText(feature, 24, 96);
  g.fillStyle = accent;
  g.fillRect(24, 110, 60, 5);

  const card = (y: number, hh: number) => {
    roundRect(g, 20, y, w - 40, hh, 18);
    g.fillStyle = "#151b2b";
    g.fill();
  };

  if (feature === "Training") {
    g.fillStyle = "#a3adc2";
    g.font = "500 20px system-ui, sans-serif";
    g.fillText("Week 4 · Upper A", 24, 156);
    const rows = ["Bench press", "Barbell row", "Overhead press", "Pull-ups", "Lateral raise"];
    rows.forEach((r, i) => {
      const y = 180 + i * 108;
      card(y, 92);
      g.fillStyle = "#e8ecf5";
      g.font = "600 24px system-ui, sans-serif";
      g.fillText(r, 40, y + 38);
      for (let s = 0; s < 4; s++) {
        roundRect(g, 40 + s * 70, y + 54, 58, 24, 8);
        g.fillStyle = s < 3 - (i % 2) ? accent : "#2a3246";
        g.fill();
      }
    });
  } else if (feature === "Nutrition") {
    card(150, 300);
    const cx = w / 2;
    const cy = 300;
    const macros = [
      { v: 0.78, c: accent },
      { v: 0.6, c: "#19c3b1" },
      { v: 0.45, c: "#ffb86b" },
    ];
    macros.forEach((m, i) => {
      const r = 110 - i * 30;
      g.lineWidth = 18;
      g.strokeStyle = "#232b3e";
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = m.c;
      g.lineCap = "round";
      g.beginPath();
      g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * m.v);
      g.stroke();
    });
    const meals = ["Breakfast · Mess", "Lunch · Dal, rice", "Snack · Photo log"];
    meals.forEach((m, i) => {
      const y = 480 + i * 96;
      card(y, 80);
      g.fillStyle = "#e8ecf5";
      g.font = "600 22px system-ui, sans-serif";
      g.fillText(m, 40, y + 48);
    });
  } else if (feature === "Running") {
    card(150, 420);
    g.strokeStyle = accent;
    g.lineWidth = 7;
    g.lineJoin = "round";
    g.beginPath();
    const pts = [
      [70, 500],
      [110, 420],
      [90, 340],
      [170, 280],
      [260, 300],
      [300, 220],
      [380, 190],
      [420, 260],
      [400, 360],
      [330, 430],
      [250, 470],
    ];
    pts.forEach(([x, y], i) => (i ? g.lineTo(x * (w / 480), y) : g.moveTo(x * (w / 480), y)));
    g.stroke();
    const stats = [
      ["Distance", "5.2 km"],
      ["Pace", "5:48 /km"],
    ];
    stats.forEach(([k, v], i) => {
      const y = 600 + i * 110;
      card(y, 94);
      g.fillStyle = "#8a93a8";
      g.font = "500 20px system-ui, sans-serif";
      g.fillText(k, 40, y + 36);
      g.fillStyle = "#e8ecf5";
      g.font = "700 30px system-ui, sans-serif";
      g.fillText(v, 40, y + 74);
    });
  } else {
    const bubbles: [boolean, number][] = [
      [false, 110],
      [true, 70],
      [false, 150],
      [true, 60],
      [false, 120],
    ];
    let y = 150;
    bubbles.forEach(([mine, hh]) => {
      const bw = w * 0.68;
      const x = mine ? w - bw - 20 : 20;
      roundRect(g, x, y, bw, hh, 20);
      g.fillStyle = mine ? accent : "#151b2b";
      g.fill();
      g.fillStyle = mine ? "rgba(10,15,28,0.55)" : "#3a445c";
      for (let l = 0; l < Math.floor(hh / 34); l++) g.fillRect(x + 20, y + 24 + l * 30, bw - 60 - l * 20, 12);
      y += hh + 22;
    });
  }
}

/** Real app screenshots, used for the features that have one. The rest keep the drawn screen. */
const SCREENSHOTS: Partial<Record<FitosFeature, string>> = {
  Training: "/images/fitos/fitos-3-workout-sm.jpg",
  Nutrition: "/images/fitos/fitos-4-mess-food-sm.jpg",
};

/** Cover-fit an image into the screen canvas. */
function drawShot(g: CanvasRenderingContext2D, w: number, h: number, img: HTMLImageElement) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  g.fillStyle = "#05070c";
  g.fillRect(0, 0, w, h);
  g.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function PhoneStation({ project }: { project: Project }) {
  const [x, , z] = project.station.position;
  const { t, near } = useStationClock(x);
  const hover = useHoverCursor();
  const set = useSite((s) => s.set);
  const feature = useSite((s) => s.fitosFeature);
  const { tex, ctx, canvas } = useCanvasTexture(480, 1000);
  const lastScreen = useRef<string>("");
  const rings = useRef<THREE.Group>(null);
  const ringMeshes = useRef<(THREE.Mesh | null)[]>([]);

  const shots = useRef<Partial<Record<FitosFeature, HTMLImageElement>>>({});

  const paint = (f: FitosFeature) => {
    const img = shots.current[f];
    if (img) drawShot(ctx, canvas.width, canvas.height, img);
    else drawScreen(ctx, canvas.width, canvas.height, f, project.accent);
    tex.needsUpdate = true;
  };

  useEffect(() => {
    // Draw immediately so the screen is never blank; screenshots swap in once loaded.
    drawScreen(ctx, canvas.width, canvas.height, FEATURES[0], project.accent);
    tex.needsUpdate = true;
    for (const [f, src] of Object.entries(SCREENSHOTS) as [FitosFeature, string][]) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        shots.current[f] = img;
        lastScreen.current = ""; // force a redraw on the next frame
      };
      img.src = src;
    }
  }, [ctx, canvas, tex, project.accent]);

  useFrame((_, dt) => {
    if (!near.current) return;
    const current = useSite.getState().fitosFeature ?? FEATURES[Math.floor(t.current / 3) % FEATURES.length];
    if (current !== lastScreen.current) {
      lastScreen.current = current;
      paint(current);
    }
    if (rings.current) rings.current.rotation.y = t.current * 0.35;
    const active = useSite.getState().fitosFeature;
    ringMeshes.current.forEach((m, i) => {
      if (!m) return;
      const target = active === FEATURES[i] ? 1.45 : 1;
      const s = THREE.MathUtils.damp(m.scale.x, target, 8, dt);
      m.scale.setScalar(s);
      m.rotation.x = t.current * 0.8 + i;
      m.rotation.y = t.current * 0.6;
    });
  });

  return (
    <group position={[x, 0, z]}>
      <BlobShadow w={1.6} d={1.0} />
      {/* phone on a small stand, tilted back */}
      <group position={[0, 0.06, 0]}>
        <mesh position={[0, 0.03, 0.12]}>
          <boxGeometry args={[0.5, 0.06, 0.3]} />
          <meshStandardMaterial color="#1c212b" metalness={0.5} roughness={0.4} />
        </mesh>
        <group
          position={[0, 0.82, 0]}
          rotation-x={-0.14}
          onClick={(e) => {
            e.stopPropagation();
            set({ panel: project.slug });
          }}
          {...hover}
        >
          <RoundedBox args={[0.78, 1.6, 0.08]} radius={0.07} smoothness={4}>
            <meshStandardMaterial color="#0e1118" metalness={0.7} roughness={0.28} />
          </RoundedBox>
          <mesh position={[0, 0, 0.0415]}>
            <planeGeometry args={[0.7, 1.5]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
          {/* camera punch-hole */}
          <mesh position={[0, 0.7, 0.042]}>
            <circleGeometry args={[0.015, 16]} />
            <meshBasicMaterial color="#000" />
          </mesh>
        </group>
      </group>

      {/* feature rings orbiting the phone */}
      <group ref={rings} position={[0, 0.9, 0]}>
        {FEATURES.map((f, i) => {
          const a = (i / FEATURES.length) * Math.PI * 2;
          const r = 0.68;
          return (
            <group key={f} position={[Math.cos(a) * r, Math.sin(a * 2) * 0.18, Math.sin(a) * r]}>
              <mesh
                ref={(m) => {
                  ringMeshes.current[i] = m;
                }}
                onPointerOver={(e) => {
                  hover.onPointerOver(e);
                  set({ fitosFeature: f });
                }}
                onPointerOut={() => {
                  hover.onPointerOut();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  set({ fitosFeature: feature === f ? null : f });
                }}
              >
                <torusGeometry args={[0.075, 0.016, 12, 40]} />
                <meshStandardMaterial
                  color={project.accent}
                  emissive={project.accent}
                  emissiveIntensity={feature === f ? 2.2 : 0.9}
                  toneMapped={false}
                />
              </mesh>
              {feature === f && (
                <Html center position={[0, 0.24, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                  <span
                    style={{
                      background: "rgba(10,15,28,0.9)",
                      border: `1px solid ${project.accent}`,
                      color: "#e8ecf5",
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-geist-sans), system-ui",
                    }}
                  >
                    {f}
                  </span>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
}
