"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { projects, type Vec3 } from "@/content/projects";
import { rail, useSite } from "@/lib/store";

export const HERO_X = -1;
export const CONTACT_X = 29;

type Stop = { target: Vec3; offset: Vec3; side: boolean };

/** Rail stops: 0 hero, 1-4 projects, 5 overview, 6 contact. */
const STOPS: Stop[] = [
  { target: [HERO_X - 0.1, 0.5, 0], offset: [0, 1.2, 6.0], side: true },
  ...projects.map((p) => {
    // Wider objects need the camera further back.
    const d = { phone: 4.4, "raspberry-pi": 4.8, esp32: 4.6, "l1-l2-stack": 5.6 }[p.station.object];
    return { target: p.station.cameraTarget, offset: [0, d * 0.32, d] as Vec3, side: true };
  }),
  { target: [14, 0.2, 0], offset: [0, 7.5, 13], side: false },
  { target: [CONTACT_X, 0.55, 0], offset: [0, 1.1, 4.0], side: true },
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const tmpTarget = new THREE.Vector3();
const tmpPos = new THREE.Vector3();

function sample(p: number, aspect: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  const clamped = THREE.MathUtils.clamp(p, 0, STOPS.length - 1);
  const i = Math.min(Math.floor(clamped), STOPS.length - 2);
  // Ease within each segment so the camera dwells at each station.
  const f = smooth(clamped - i);
  const a = STOPS[i];
  const b = STOPS[i + 1];

  const wide = aspect >= 1.1;
  const shift = (s: Stop): Vec3 => {
    if (!s.side) return [0, 0, 0];
    // Desktop: the HTML card sits on the left, so frame the object right of centre.
    // Portrait: the card covers the lower half, so frame the object higher.
    return wide ? [-1.5, 0, 0] : [0, -0.55, 1.8];
  };
  const sa = shift(a);
  const sb = shift(b);

  for (let k = 0; k < 3; k++) {
    const ta = a.target[k] + sa[k];
    const tb = b.target[k] + sb[k];
    const t = ta + (tb - ta) * f;
    const pa = ta + a.offset[k];
    const pb = tb + b.offset[k];
    outTarget.setComponent(k, t);
    outPos.setComponent(k, pa + (pb - pa) * f);
  }
}

export function CameraRail() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const look = useRef(new THREE.Vector3(HERO_X, 0.5, 0));
  const pointer = useRef({ x: 0, y: 0 });
  const first = useRef(true);

  useFrame((state, dt) => {
    const aspect = size.width / Math.max(size.height, 1);
    sample(rail.progress, aspect, tmpPos, tmpTarget);

    const reduced = useSite.getState().reducedMotion;
    // Gentle pointer parallax (off under reduced motion).
    if (!reduced) {
      pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 3, dt);
      pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 3, dt);
      tmpPos.x += pointer.current.x * 0.25;
      tmpPos.y += pointer.current.y * 0.12;
    }

    if (first.current || reduced) {
      // Reduced motion: no tweening, the camera cuts to its rail position.
      camera.position.copy(tmpPos);
      look.current.copy(tmpTarget);
      first.current = false;
    } else {
      const l = 5;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, tmpPos.x, l, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, tmpPos.y, l, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, tmpPos.z, l, dt);
      look.current.x = THREE.MathUtils.damp(look.current.x, tmpTarget.x, l, dt);
      look.current.y = THREE.MathUtils.damp(look.current.y, tmpTarget.y, l, dt);
      look.current.z = THREE.MathUtils.damp(look.current.z, tmpTarget.z, l, dt);
    }
    camera.lookAt(look.current);
  });

  return null;
}
