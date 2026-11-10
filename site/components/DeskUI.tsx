"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notes } from "@/content/notes";
import { getProject } from "@/content/projects";
import { useSite } from "@/lib/store";

const FOUND_KEY = "srijansri:notes";

function readFound(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(FOUND_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * HTML controls and overlays for the desk extras. Only shown while the 3D
 * scene is running: sound toggle, photo mode, and the sticky-note card.
 */
export function DeskUI() {
  const active = useSite((s) => s.sceneActive);
  const noteId = useSite((s) => s.note);
  const sound = useSite((s) => s.sound);
  const photo = useSite((s) => s.photo);
  const set = useSite((s) => s.set);
  const [found, setFound] = useState<string[]>([]);

  // Remember which notes this visitor has opened (this browser only).
  useEffect(
    () =>
      useSite.subscribe((s, prev) => {
        if (!s.note || s.note === prev.note) return;
        const next = Array.from(new Set([...readFound(), s.note]));
        try {
          localStorage.setItem(FOUND_KEY, JSON.stringify(next));
        } catch {
          /* storage unavailable: the count lasts this visit only */
        }
        setFound(next);
      }),
    [],
  );

  // Photo mode hides the page via CSS (globals.css); Escape leaves it.
  useEffect(() => {
    if (!photo) return;
    document.documentElement.dataset.photo = "on";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && set({ photo: false });
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.documentElement.dataset.photo;
      window.removeEventListener("keydown", onKey);
    };
  }, [photo, set]);

  // Leaving the scene (3D turned off) also leaves photo mode and closes any note.
  useEffect(() => {
    if (!active) set({ photo: false, note: null });
  }, [active, set]);

  if (!active) return null;
  const note = notes.find((n) => n.id === noteId);
  const project = note ? getProject(note.slug) : undefined;
  const btn = "glass rounded-md px-2.5 py-1.5 text-dim transition-colors hover:text-text";

  return (
    <>
      {photo ? (
        <div className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center gap-2 text-sm">
          <button type="button" onClick={() => set({ photoShot: useSite.getState().photoShot + 1 })} className="rounded-lg bg-lamp px-4 py-2 font-semibold text-[#1a1206]">
            Save photo
          </button>
          <button type="button" onClick={() => set({ photo: false })} className="glass rounded-lg px-4 py-2 text-text">
            Exit photo mode
          </button>
        </div>
      ) : (
        <div className="photo-hide fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-30 flex items-center gap-2 text-xs">
          <button type="button" aria-pressed={sound} onClick={() => set({ sound: !sound })} className={`${btn} hidden sm:block`}>
            Sound: {sound ? "on" : "off"}
          </button>
          <button type="button" onClick={() => set({ photo: true, note: null })} className={`${btn} hidden sm:block`}>
            Photo mode
          </button>
        </div>
      )}

      {note && !photo && (
        <aside
          aria-label="Sticky note"
          className="photo-hide fixed inset-x-3 bottom-4 z-40 mx-auto max-w-md sm:bottom-16 rounded-xl border border-[#f2d45c]/60 bg-[#2a2410]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#f2d45c]">
              Sticky note · found {found.length} of {notes.length}
            </p>
            <button type="button" onClick={() => set({ note: null })} className="rounded-md border border-white/15 px-2 py-0.5 text-xs text-dim hover:text-text">
              Close
            </button>
          </div>
          <p className="mt-2 font-display text-lg font-semibold text-text">{note.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-dim">{note.text}</p>
          {project && (
            <Link href={`/projects/${project.slug}`} className="mt-3 inline-block text-sm text-[#f2d45c] underline underline-offset-2">
              From {project.shortTitle} →
            </Link>
          )}
        </aside>
      )}
    </>
  );
}
