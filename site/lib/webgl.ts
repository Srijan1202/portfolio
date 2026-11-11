"use client";

/**
 * Shared checks for whether to run any 3D on this device. Used by the home
 * workbench (WebGLGate) and the small model in each project page header.
 */

export const PREF_KEY = "srijansri:3d";
export const SLOW_KEY = "srijansri:3d-slow";

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    // Release the probe context right away; browsers cap live contexts.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

export function readPref(): string | null {
  try {
    return localStorage.getItem(PREF_KEY);
  } catch {
    return null;
  }
}

export function writePref(v: "on" | "off") {
  try {
    localStorage.setItem(PREF_KEY, v);
  } catch {
    /* storage unavailable: preference lasts this visit only */
  }
}

/** Read the "this device renders 3D slowly" flag for this session; pass a boolean to set or clear it. */
export function sessionSlowFlag(set?: boolean): boolean {
  try {
    if (set === true) sessionStorage.setItem(SLOW_KEY, "1");
    if (set === false) sessionStorage.removeItem(SLOW_KEY);
    return sessionStorage.getItem(SLOW_KEY) === "1";
  } catch {
    return false;
  }
}

export function isLowEnd(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (nav.hardwareConcurrency ?? 8) <= 2;
}

export function isSmallScreen(): boolean {
  return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
}

const PREVIEW_SLOW_KEY = "srijansri:preview-slow";

/** Like sessionSlowFlag, for the small header models only. */
export function previewSlowFlag(set?: boolean): boolean {
  try {
    if (set === true) sessionStorage.setItem(PREVIEW_SLOW_KEY, "1");
    return sessionStorage.getItem(PREVIEW_SLOW_KEY) === "1";
  } catch {
    return false;
  }
}
