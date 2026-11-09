"use client";

import { useEffect } from "react";
import { rail, useSite } from "@/lib/store";

/**
 * Maps window scroll to a float position on the camera rail.
 * Every element with data-rail="<stop>" is an anchor: when its centre is at
 * the viewport centre, the rail is exactly at that stop. Between anchors the
 * progress is interpolated linearly.
 *
 * Also adds ← / → keyboard navigation between stations.
 */
export function RailTracker() {
  useEffect(() => {
    let anchors: { y: number; stop: number; el: HTMLElement }[] = [];

    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"));
      anchors = els
        .map((el) => {
          const r = el.getBoundingClientRect();
          const top = r.top + window.scrollY;
          return { y: top + r.height / 2 - window.innerHeight / 2, stop: Number(el.dataset.rail), el };
        })
        .sort((a, b) => a.y - b.y);
      update();
    };

    const update = () => {
      if (anchors.length === 0) return;
      const y = window.scrollY;
      let p = anchors[0].stop;
      if (y >= anchors[anchors.length - 1].y) p = anchors[anchors.length - 1].stop;
      else {
        for (let i = 0; i < anchors.length - 1; i++) {
          const a = anchors[i];
          const b = anchors[i + 1];
          if (y >= a.y && y < b.y) {
            const t = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y);
            p = a.stop + (b.stop - a.stop) * t;
            break;
          }
        }
      }
      rail.progress = p;
      const stop = Math.round(p);
      if (useSite.getState().activeStop !== stop) useSite.getState().set({ activeStop: stop });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (t?.closest("[role=radiogroup], dialog")) return;
      // Unique anchors (first element per stop) in scroll order.
      const seen = new Set<number>();
      const stops = anchors.filter((a) => (seen.has(a.stop) ? false : (seen.add(a.stop), true)));
      const current = Math.round(rail.progress);
      const idx = stops.findIndex((a) => a.stop === current);
      const nextIdx = e.key === "ArrowRight" ? idx + 1 : idx - 1;
      const target = stops[nextIdx];
      if (!target) return;
      e.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: Math.max(0, target.y), behavior: reduce ? "auto" : "smooth" });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("keydown", onKey);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
