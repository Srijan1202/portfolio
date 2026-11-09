"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSite } from "@/lib/store";

export const FONT_BOLD = "/fonts/space-grotesk-latin-700-normal.woff";
export const FONT_MEDIUM = "/fonts/space-grotesk-latin-500-normal.woff";

/**
 * A per-station clock. It stops advancing under prefers-reduced-motion and
 * while the camera is far from the station (saves work off-screen).
 * Returns a ref holding the elapsed animation time in seconds.
 */
export function useStationClock(stationX: number, range = 9) {
  const t = useRef(0);
  const near = useRef(true);
  useFrame((state, dt) => {
    near.current = Math.abs(state.camera.position.x - stationX) < range || state.camera.position.y > 4;
    if (useSite.getState().reducedMotion || !near.current) return;
    t.current += Math.min(dt, 0.1);
  });
  return { t, near };
}

/** Pointer cursor while hovering an interactive mesh. */
export function useHoverCursor() {
  const gl = useThree((s) => s.gl);
  return useMemo(
    () => ({
      onPointerOver: (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        gl.domElement.style.cursor = "pointer";
      },
      onPointerOut: () => {
        gl.domElement.style.cursor = "";
      },
    }),
    [gl],
  );
}

/** A canvas-backed texture that can be redrawn; disposed on unmount. */
export function useCanvasTexture(width: number, height: number) {
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [width, height]);
  useEffect(() => () => tex.dispose(), [tex]);
  const ctx = (tex.image as HTMLCanvasElement).getContext("2d")!;
  return { tex, ctx, canvas: tex.image as HTMLCanvasElement };
}

/** Soft radial blob used as a cheap contact shadow under objects. */
let blobTex: THREE.Texture | null = null;
export function getBlobTexture() {
  if (blobTex) return blobTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.7)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}

export function BlobShadow({ w, d, opacity = 1 }: { w: number; d: number; opacity?: number }) {
  const map = useMemo(() => getBlobTexture(), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.002} renderOrder={-1}>
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial map={map} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/** Deterministic PRNG (mulberry32) so procedural detail is stable across renders. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
