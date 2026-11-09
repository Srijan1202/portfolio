/**
 * Architecture diagrams for the project pages, built in HTML so they stay
 * crisp, responsive and readable by screen readers.
 */

import Image from "next/image";

function Box({
  title,
  sub,
  accent,
  className = "",
}: {
  title: string;
  sub?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${className}`}
      style={{
        borderColor: accent ? "var(--accent)" : "var(--line-strong)",
        background: accent ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "rgba(255,255,255,0.02)",
      }}
    >
      <p className="text-sm font-medium text-text">{title}</p>
      {sub && <p className="mt-0.5 text-xs leading-snug text-faint">{sub}</p>}
    </div>
  );
}

function Arrow({ label, down = false }: { label?: string; down?: boolean }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center text-faint ${down ? "flex-col py-1" : "px-1"}`}
    >
      <span className="text-lg leading-none">{down ? "↓" : "→"}</span>
      {label && <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>}
    </div>
  );
}

function Frame({ title, children, caption }: { title: string; children: React.ReactNode; caption?: string }) {
  return (
    <figure className="not-prose my-8 rounded-xl border border-line bg-black/20 p-4 sm:p-6">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-faint">{title}</p>
      {children}
      {caption && <figcaption className="mt-4 text-xs leading-relaxed text-faint">{caption}</figcaption>}
    </figure>
  );
}

export function FitosArchitecture() {
  return (
    <Frame
      title="FITOS monorepo"
      caption="The server is the source of truth. Zod contracts generate the OpenAPI spec (185 operations); CI fails if the spec drifts from the code."
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1.2fr_auto_1fr] md:items-center">
        <div className="space-y-2">
          <Box title="apps/mobile" sub="Flutter · ~140k lines Dart · Riverpod · Drift local DB" accent />
          <Box title="apps/admin" sub="Next.js" />
        </div>
        <Arrow label="HTTPS" />
        <div className="space-y-2">
          <Box title="apps/api" sub="Fastify · 185 operations" accent />
          <div className="space-y-2">
            <Box title="packages/core" sub="~11k lines TS · deterministic domain engine" />
            <div className="grid grid-cols-2 gap-2">
              <Box title="contracts" sub="Zod → OpenAPI" />
              <Box title="config" sub="shared" />
            </div>
          </div>
        </div>
        <Arrow />
        <div className="space-y-2">
          <Box title="PostgreSQL" sub="71 tables · 49 migrations, each with a tested rollback" />
          <Box title="Gemini" sub="AI coach (streaming) · meal photos" />
        </div>
      </div>
    </Frame>
  );
}

export function EmotionPipeline() {
  const steps = [
    { title: "Sensors", sub: "MAX30102 · MPU6050 · GSR" },
    { title: "Signal-quality checks", sub: "per channel" },
    { title: "Adaptive Weighted Fusion", sub: "trust follows quality", accent: true },
    { title: "State estimate", sub: "+ trajectory (ETP), load (SAI)" },
    { title: "Feedback", sub: "haptics · LEDs · OLED · Wi-Fi dashboard" },
  ];
  return (
    <Frame title="Signal path on the ESP32" caption="Everything runs on-device in under 600 KB of SRAM.">
      <ol className="flex flex-col gap-1 md:flex-row md:items-stretch">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col md:flex-1 md:flex-row md:items-center">
            <Box title={s.title} sub={s.sub} accent={s.accent} className="md:h-full md:flex-1" />
            {i < steps.length - 1 && (
              <>
                <span className="md:hidden">
                  <Arrow down />
                </span>
                <span className="hidden md:block">
                  <Arrow />
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

export function ForcedInclusionPath() {
  return (
    <Frame
      title="Normal path and the two escape hatches"
      caption="Arbitrum needs two L1 transactions from the user and a 7,200-block wait. The OP Stack needs one, and its derivation pipeline must include the deposit by itself. On a healthy Arbitrum chain the sequencer reads the message long before the wait ends, so the force step never becomes available."
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs text-faint">Normal path</p>
          <div className="flex flex-wrap items-center gap-1">
            <Box title="User tx" />
            <Arrow />
            <Box title="Sequencer" sub="orders txs" />
            <Arrow />
            <Box title="L2 block" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-faint">Arbitrum Nitro escape hatch</p>
          <div className="flex flex-wrap items-center gap-1">
            <Box title="sendL2Message" sub="L1 tx 1 · delayed inbox" accent />
            <Arrow label="wait" />
            <Box title="7,200 L1 blocks" sub="≈ 24 h (delayBlocks)" />
            <Arrow />
            <Box title="forceInclusion" sub="L1 tx 2 · sweeps the queue" accent />
            <Arrow />
            <Box title="L2 block" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-faint">OP Stack escape hatch</p>
          <div className="flex flex-wrap items-center gap-1">
            <Box title="depositTransaction" sub="L1 tx 1 · OptimismPortal" accent />
            <Arrow />
            <Box title="Derivation" sub="must include it within 3,600 L1 blocks (≈ 12 h)" />
            <Arrow />
            <Box title="L2 block" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Real output lines from a recorded run, shown as a static terminal. */
export function Terminal({ command, lines, caption }: { command: string; lines: string[]; caption?: string }) {
  return (
    <figure className="not-prose my-8">
      <div className="overflow-hidden rounded-xl border border-line bg-[#070b14]">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-dim">
          <span className="text-accent">$ </span>
          <span className="text-text">{command}</span>
          {"\n"}
          {lines.join("\n")}
        </pre>
      </div>
      {caption && <figcaption className="mt-3 text-xs leading-relaxed text-faint">{caption}</figcaption>}
    </figure>
  );
}

export function Photo({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}) {
  return (
    <figure className="not-prose my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, 640px"
        className="mx-auto h-auto max-h-[75vh] w-auto rounded-xl border border-line"
      />
      {caption && <figcaption className="mt-3 text-center text-xs leading-relaxed text-faint">{caption}</figcaption>}
    </figure>
  );
}

/** A row of phone screenshots: 2 columns on phones, 3 on wider screens. */
export function Screens({ shots }: { shots: { src: string; alt: string; label: string }[] }) {
  return (
    <figure className="not-prose my-8">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {shots.map((s) => (
          <li key={s.src}>
            <Image
              src={s.src}
              alt={s.alt}
              width={1080}
              height={2400}
              sizes="(max-width: 640px) 45vw, 220px"
              className="h-auto w-full rounded-2xl border border-line"
            />
            <p className="mt-2 text-center text-xs text-faint">{s.label}</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** A short product video. Not autoplaying: it starts only when the visitor presses play. */
export function Video({ src, poster, caption, label }: { src: string; poster: string; caption?: string; label: string }) {
  return (
    <figure className="not-prose my-8">
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label}
        className="mx-auto max-h-[75vh] w-auto max-w-full rounded-2xl border border-line bg-black"
      >
        <source src={src} type="video/mp4" />
      </video>
      {caption && <figcaption className="mt-3 text-center text-xs leading-relaxed text-faint">{caption}</figcaption>}
    </figure>
  );
}

/**
 * Per-ordering medians and interquartile ranges over 10 sequences each,
 * from Table II of the TDAS paper. Two panels because the measures have
 * different units: one axis per chart.
 */
const ORDERINGS = [
  { name: "hot-first", knee: [13.3, 7.0, 17.7], p99: [201.26, 201.05, 201.61] },
  { name: "cool-first", knee: [0.8, 0.0, 25.3], p99: [201.35, 200.27, 207.6] },
  { name: "alternating", knee: [0.0, 0.0, 0.0], p99: [202.14, 201.76, 202.42] },
  { name: "random", knee: [0.0, 0.0, 0.0], p99: [201.51, 201.34, 201.83] },
] as const;

function DotPanel({
  title,
  unit,
  domain,
  ticks,
  pick,
  reference,
}: {
  title: string;
  unit: string;
  domain: [number, number];
  ticks: number[];
  pick: "knee" | "p99";
  reference?: { value: number; label: string };
}) {
  const W = 320;
  const H = 176;
  const m = { l: 82, r: 14, t: 10, b: 30 };
  const step = (H - m.t - m.b) / ORDERINGS.length;
  const sx = (v: number) => m.l + ((v - domain[0]) / (domain[1] - domain[0])) * (W - m.l - m.r);
  const ry = (i: number) => m.t + step * (i + 0.5);
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text">{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}, median and interquartile range per ordering`} className="h-auto w-full">
        {ticks.map((t, i) => (
          <g key={t}>
            <line x1={sx(t)} x2={sx(t)} y1={m.t} y2={H - m.b} stroke="var(--line)" />
            <text x={sx(t)} y={H - m.b + 18} textAnchor="middle" fontSize="11" fill="var(--text-faint)">
              {i === ticks.length - 1 ? `${t} ${unit}` : t}
            </text>
          </g>
        ))}
        {reference && (
          <g>
            <line
              x1={sx(reference.value)}
              x2={sx(reference.value)}
              y1={m.t}
              y2={H - m.b}
              stroke="var(--text-faint)"
              strokeDasharray="3 3"
            />
            <title>{reference.label}</title>
          </g>
        )}
        {ORDERINGS.map((o, i) => {
          const [med, q1, q3] = o[pick];
          return (
            <g key={o.name}>
              <text x={m.l - 10} y={ry(i)} dy="0.32em" textAnchor="end" fontSize="12" fill="var(--text-dim)">
                {o.name}
              </text>
              {/* generous hover target */}
              <rect x={m.l} y={ry(i) - step / 2} width={W - m.l - m.r} height={step} fill="transparent" />
              {q3 > q1 && (
                <line x1={sx(q1)} x2={sx(q3)} y1={ry(i)} y2={ry(i)} stroke="var(--tdas)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
              )}
              <circle cx={sx(med)} cy={ry(i)} r="5" fill="var(--tdas)" stroke="var(--bg)" strokeWidth="2" />
              <title>
                {o.name}: median {med} {unit} (IQR {q1}–{q3})
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function TdasOrderingResult() {
  return (
    <Frame
      title="What ordering changed, and what it didn't"
      caption="Dots are medians over 10 sequences per ordering; lines are interquartile ranges. Ordering changed how long the chip sat above its 80.8 °C throttling point, but per-sequence P99 latency stayed within 1 ms. Dashed line: a cold job, ~196 ms. Source: Table II of the paper."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <DotPanel title="Time above the throttling point" unit="s" domain={[0, 30]} ticks={[0, 10, 20, 30]} pick="knee" />
        <DotPanel
          title="P99 job latency"
          unit="ms"
          domain={[195, 209]}
          ticks={[196, 200, 204, 208]}
          pick="p99"
          reference={{ value: 196.4, label: "A cold job takes ~196.4 ms" }}
        />
      </div>
      <details className="mt-3 text-sm text-dim">
        <summary className="cursor-pointer text-faint hover:text-text">Show as table</summary>
        <table className="mt-2">
          <thead>
            <tr>
              <th>Ordering</th>
              <th>Time above 80.8 °C (s)</th>
              <th>P99 latency (ms)</th>
            </tr>
          </thead>
          <tbody>
            {ORDERINGS.map((o) => (
              <tr key={o.name}>
                <td>{o.name}</td>
                <td>
                  {o.knee[0]} [{o.knee[1]}, {o.knee[2]}]
                </td>
                <td>
                  {o.p99[0]} [{o.p99[1]}, {o.p99[2]}]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Frame>
  );
}

/**
 * Schematic of the reported latency-vs-temperature relationship.
 * Drawn from the summary values in the paper, not from raw samples.
 */
export function TdasLatencyChart() {
  // Plot area in SVG units
  const W = 640;
  const H = 300;
  const m = { l: 56, r: 20, t: 20, b: 44 };
  const x0 = 76;
  const x1 = 85;
  const y0 = 190;
  const y1 = 216;
  const sx = (t: number) => m.l + ((t - x0) / (x1 - x0)) * (W - m.l - m.r);
  const sy = (v: number) => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b);
  const xt = [76, 78, 80, 82, 84];
  const yt = [190, 196, 202, 208, 214];
  const thr = 80.8;

  return (
    <Frame
      title="Job latency vs SoC temperature (schematic)"
      caption="Schematic of the reported values, not raw samples: a flat ~196 ms below the 80.8 °C throttling point and 208–212 ms when throttled. Fitted slope +0.208 ms/°C (95% CI [+0.070, +0.343]). The full scatter figure is in the paper."
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="tdas-chart-desc" className="h-auto w-full">
        <desc id="tdas-chart-desc">
          Latency stays near 196 milliseconds below 80.8 degrees Celsius, then sits between 208 and 212 milliseconds
          once the chip throttles.
        </desc>
        {/* recessive grid */}
        {yt.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={sy(v)} y2={sy(v)} stroke="var(--line)" />
            <text x={m.l - 10} y={sy(v)} dy="0.32em" textAnchor="end" fontSize="12" fill="var(--text-faint)">
              {v}
            </text>
          </g>
        ))}
        {xt.map((t) => (
          <text key={t} x={sx(t)} y={H - m.b + 20} textAnchor="middle" fontSize="12" fill="var(--text-faint)">
            {t} °C
          </text>
        ))}
        <text x={14} y={m.t + 4} fontSize="12" fill="var(--text-faint)" transform={`rotate(-90 14 ${m.t + 4})`} textAnchor="end">
          ms
        </text>

        {/* throttling point */}
        <line x1={sx(thr)} x2={sx(thr)} y1={m.t} y2={H - m.b} stroke="var(--text-faint)" strokeDasharray="4 4" />
        <text x={sx(thr) + 6} y={m.t + 12} fontSize="12" fill="var(--text-dim)">
          throttling point 80.8 °C
        </text>

        {/* throttled band 208–212 */}
        <g className="group">
          <rect
            x={sx(thr)}
            y={sy(212)}
            width={sx(x1) - sx(thr)}
            height={sy(208) - sy(212)}
            rx="4"
            fill="var(--tdas)"
            opacity="0.18"
          />
          <title>Throttled: 208–212 ms</title>
        </g>

        {/* regime line */}
        <polyline
          points={`${sx(x0)},${sy(196)} ${sx(thr)},${sy(196)} ${sx(thr)},${sy(210)} ${sx(x1)},${sy(210)}`}
          fill="none"
          stroke="var(--tdas)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <g>
          <circle cx={sx(78.4)} cy={sy(196)} r="5" fill="var(--tdas)" stroke="var(--bg)" strokeWidth="2" />
          <title>Below 80.8 °C: ~196 ms</title>
        </g>
        <g>
          <circle cx={sx(82.9)} cy={sy(210)} r="5" fill="var(--tdas)" stroke="var(--bg)" strokeWidth="2" />
          <title>Throttled: 208–212 ms</title>
        </g>
        <text x={sx(78.4)} y={sy(196) - 12} textAnchor="middle" fontSize="13" fill="var(--text)">
          ~196 ms
        </text>
        <text x={sx(82.9)} y={sy(212) - 10} textAnchor="middle" fontSize="13" fill="var(--text)">
          208–212 ms
        </text>
      </svg>
      <details className="mt-3 text-sm text-dim">
        <summary className="cursor-pointer text-faint hover:text-text">Show as table</summary>
        <table className="mt-2">
          <thead>
            <tr>
              <th>Regime</th>
              <th>Job latency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Below 80.8 °C</td>
              <td>~196 ms (flat)</td>
            </tr>
            <tr>
              <td>Throttled</td>
              <td>208–212 ms</td>
            </tr>
            <tr>
              <td>Fitted slope</td>
              <td>+0.208 ms/°C, 95% CI [+0.070, +0.343]</td>
            </tr>
          </tbody>
        </table>
      </details>
    </Frame>
  );
}

export function Callout({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "honest" }) {
  return (
    <div
      className="my-6 rounded-lg border-l-2 bg-white/[0.03] px-4 py-3 text-[15px]"
      style={{ borderColor: tone === "honest" ? "var(--lamp)" : "var(--accent)" }}
    >
      {children}
    </div>
  );
}

export function MediaSlot({ label }: { label: string }) {
  return (
    <div className="my-6 flex aspect-video items-center justify-center rounded-xl border border-dashed border-todo/50 bg-todo/5 p-6 text-center text-sm text-todo">
      <span>
        <span className="mr-1 font-mono text-xs">O-7</span> Media to add: {label}
      </span>
    </div>
  );
}
