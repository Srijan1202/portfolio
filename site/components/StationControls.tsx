"use client";

import { useId, useState } from "react";
import { useSite, type FitosFeature, type JobOrder, type SensorId } from "@/lib/store";
import { fusionConfidence, fusionWeights, sensorLabels } from "@/lib/sim";

/**
 * HTML controls for each station's interaction. They drive the 3D scene via
 * the shared store, and only appear while the scene is running.
 * On phones they start collapsed so the card leaves room to see the model.
 */
function Shell({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  const active = useSite((s) => s.sceneActive);
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!active) return null;
  return (
    <section className="mt-5 rounded-xl border border-line bg-black/20 p-4 max-sm:p-3" aria-label={title}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left font-mono text-[11px] uppercase tracking-[0.16em] text-faint sm:hidden"
      >
        Try it on the model
        <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      <div id={id} className={open ? "max-sm:mt-3" : "max-sm:hidden"}>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-faint max-sm:hidden">{title}</p>
        {children}
        {note && <p className="mt-3 text-xs leading-relaxed text-faint">{note}</p>}
      </div>
    </section>
  );
}

const features: { id: FitosFeature; text: string }[] = [
  { id: "Training", text: "Progressive overload, deloads and MEV/MAV/MRV volume landmarks." },
  { id: "Nutrition", text: "1,864 Indian foods, VIT mess menus and Gemini meal-photo logging." },
  { id: "Running", text: "GPS runs with MapLibre and Galaxy Watch support." },
  { id: "AI Coach", text: "A Gemini coach with streaming replies, grounded in your logs." },
];

export function FitosControls() {
  const current = useSite((s) => s.fitosFeature);
  const set = useSite((s) => s.set);
  const active = features.find((f) => f.id === current);
  return (
    <Shell title="Explore the rings">
      <div className="flex flex-wrap gap-2">
        {features.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={current === f.id}
            onMouseEnter={() => set({ fitosFeature: f.id })}
            onFocus={() => set({ fitosFeature: f.id })}
            onClick={() => set({ fitosFeature: current === f.id ? null : f.id })}
            className="rounded-full border border-line-strong px-3 py-1 text-sm text-dim transition-colors aria-pressed:border-[var(--fitos)] aria-pressed:bg-[var(--fitos)]/15 aria-pressed:text-text"
          >
            {f.id}
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-[2.5em] text-sm text-dim" aria-live="polite">
        {active ? active.text : "Hover a ring on the desk, or pick a feature."}
      </p>
    </Shell>
  );
}

const orders: { id: JobOrder; label: string }[] = [
  { id: "hot-first", label: "Hot-first" },
  { id: "cool-first", label: "Cool-first" },
  { id: "alternating", label: "Alternating" },
  { id: "random", label: "Random" },
];

export function TdasControls() {
  const order = useSite((s) => s.tdasOrder);
  const set = useSite((s) => s.set);
  const onKey = (e: React.KeyboardEvent) => {
    const i = orders.findIndex((o) => o.id === order);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      set({ tdasOrder: orders[(i + 1) % orders.length].id });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      set({ tdasOrder: orders[(i + orders.length - 1) % orders.length].id });
    }
  };
  return (
    <Shell
      title="Job order"
      note="The heat animation is an illustration of each order's shape. The numbers are the measured results across all 40 runs."
    >
      <div role="radiogroup" aria-label="Job order" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" onKeyDown={onKey}>
        {orders.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={order === o.id}
            tabIndex={order === o.id ? 0 : -1}
            onClick={() => set({ tdasOrder: o.id })}
            className="rounded-md border border-line-strong px-2 py-1.5 text-sm text-dim transition-colors aria-checked:border-[var(--tdas)] aria-checked:bg-[var(--tdas)]/15 aria-checked:text-text"
          >
            {o.label}
          </button>
        ))}
      </div>
      <ul className="mt-3 space-y-1 text-sm text-dim">
        <li>
          <span className="text-text">13.3 s → 0 s</span> above the 80.8 °C throttling point per run
        </li>
        <li>
          P99 latency moved <span className="text-text">&lt; 1 ms (0.44%)</span>: hypothesis rejected
        </li>
      </ul>
    </Shell>
  );
}

export function EmotionControls() {
  const unplugged = useSite((s) => s.unplugged);
  const toggle = useSite((s) => s.toggleSensor);
  const w = fusionWeights(unplugged);
  const conf = fusionConfidence(unplugged);
  const ids: SensorId[] = ["hr", "motion", "gsr"];
  return (
    <Shell
      title="Unplug a sensor"
      note="Illustrative weights. Adaptive Weighted Fusion lowers trust in a channel as its signal quality drops, so the estimate degrades gracefully."
    >
      <div className="space-y-2">
        {ids.map((id) => {
          const off = unplugged[id];
          return (
            <div key={id} className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={!off}
                onClick={() => toggle(id)}
                className="w-36 shrink-0 rounded-md border border-line-strong px-2 py-1 text-left text-sm text-dim transition-colors aria-checked:border-[var(--emotion)]/70 aria-checked:text-text"
              >
                <span className="font-mono text-[11px] text-faint">{sensorLabels[id].part}</span>
                <span className="block leading-tight">{off ? "Unplugged" : sensorLabels[id].name}</span>
              </button>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5" aria-hidden>
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${(w[id] * 100).toFixed(0)}%`, background: off ? "#5b6478" : "var(--emotion)" }}
                />
              </div>
              <span className="w-10 text-right font-mono text-xs text-dim">{(w[id] * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-dim" aria-live="polite">
        Fused-estimate confidence: <span className="text-text">{Math.round(conf * 100)}%</span>
      </p>
    </Shell>
  );
}

export function EscapeControls() {
  const offline = useSite((s) => s.sequencerOffline);
  const set = useSite((s) => s.set);
  return (
    <Shell title="Escape hatch" note="Illustration of the forced-inclusion path. Measured delays will appear here once results are in.">
      <button
        type="button"
        aria-pressed={offline}
        onClick={() => set({ sequencerOffline: !offline })}
        className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
        style={{
          borderColor: offline ? "#ff5d73" : "var(--line-strong)",
          color: offline ? "#ffb3bf" : "var(--text)",
          background: offline ? "rgba(255,93,115,0.12)" : "transparent",
        }}
      >
        {offline ? "Bring the sequencer back" : "Take the sequencer offline"}
      </button>
      <p className="mt-3 text-sm text-dim" aria-live="polite">
        {offline
          ? "Sequencer down. The transaction goes to L1, waits out the delay window, and is force-included into L2."
          : "Normal path: the sequencer orders the transaction straight into L2."}
      </p>
    </Shell>
  );
}

export function StationControls({ slug }: { slug: string }) {
  switch (slug) {
    case "fitos":
      return <FitosControls />;
    case "thermal-aware-job-ordering":
      return <TdasControls />;
    case "emotion-detection":
      return <EmotionControls />;
    case "l2-escape-bench":
      return <EscapeControls />;
    default:
      return null;
  }
}
