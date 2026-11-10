"use client";

import { useCallback, useEffect, useState } from "react";
import { projects } from "@/content/projects";
import { profile } from "@/content/site";

/**
 * The 60-second tour: scrolls the page from stop to stop by itself (the 3D
 * camera follows the scroll), with one caption per stop. Any scroll, key or
 * touch from the visitor hands control back.
 */

const SECONDS_PER_STOP = 8;

const CAPTIONS: Record<number, { title: string; text: string }> = {
  0: { title: profile.name, text: profile.tagline },
  ...Object.fromEntries(
    projects.map((p, i) => [
      i + 1,
      { title: p.shortTitle, text: `${p.oneLiner} Headline: ${p.stats[0].value} ${p.stats[0].label}.` },
    ]),
  ),
  5: { title: "Experience and skills", text: "Two internships, and a skills list where every line points at the project that proves it." },
  6: { title: "Get in touch", text: `Email is fastest: ${profile.email}. There's also a working terminal here.` },
};

function stops(): { stop: number; y: number }[] {
  const seen = new Set<number>();
  return Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"))
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { stop: Number(el.dataset.rail), y: Math.max(0, r.top + window.scrollY + r.height / 2 - window.innerHeight / 2) };
    })
    .sort((a, b) => a.y - b.y)
    .filter((s) => (seen.has(s.stop) ? false : (seen.add(s.stop), true)));
}

export function TourButton() {
  const [at, setAt] = useState<number | null>(null); // index into the stop list
  const [list, setList] = useState<{ stop: number; y: number }[]>([]);

  const stop = useCallback(() => setAt(null), []);

  const start = () => {
    const found = stops();
    setList(found);
    if (found.length) setAt(0);
  };

  // Move to the current stop, then queue the next one.
  useEffect(() => {
    if (at === null) return;
    const s = list[at];
    if (!s) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Look the position up again at every stop: the layout changes if the 3D scene turns itself off mid-tour.
    const y = stops().find((x) => x.stop === s.stop)?.y ?? s.y;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    const t = window.setTimeout(() => {
      setAt((cur) => (cur === null ? null : cur + 1 < list.length ? cur + 1 : null));
    }, SECONDS_PER_STOP * 1000);
    return () => window.clearTimeout(t);
  }, [at, list]);

  // The visitor taking over ends the tour.
  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (["Escape", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) stop();
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, [at, stop]);

  const cur = at === null ? null : list[at];
  const caption = cur ? CAPTIONS[cur.stop] : null;
  const total = list.length;

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="rounded-lg border border-lamp/60 bg-bg/40 px-4 py-2.5 text-sm font-medium text-lamp hover:border-lamp"
      >
        <span aria-hidden>▶ </span>60-second tour
      </button>
      {at !== null && caption && (
        <div
          role="status"
          className="glass pointer-events-auto fixed inset-x-3 top-[4.25rem] z-50 mx-auto max-w-xl sm:left-auto sm:right-4 sm:mx-0 sm:w-[26rem] rounded-xl p-4 shadow-2xl shadow-black/50"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lamp">
                Tour · {at + 1} of {total}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-text">{caption.title}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setAt((c) => (c === null ? null : c + 1 < total ? c + 1 : null))}
                className="rounded-md border border-line-strong px-2.5 py-1 text-xs text-dim hover:text-text"
              >
                {at + 1 < total ? "Next" : "Finish"}
              </button>
              <button
                type="button"
                onClick={stop}
                className="rounded-md border border-line-strong px-2.5 py-1 text-xs text-dim hover:text-text"
              >
                Stop
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-dim">{caption.text}</p>
          {/* key restarts the fill animation at each stop */}
          <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <div key={at} className="tour-fill h-full bg-lamp" style={{ animationDuration: `${SECONDS_PER_STOP}s` }} />
          </div>
        </div>
      )}
    </>
  );
}
