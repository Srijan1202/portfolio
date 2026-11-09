/**
 * Single source of truth for project content.
 * Feeds the home-page cards, the 3D station labels, the /lite page and the
 * /projects/[slug] headers. Long-form copy lives in content/projects/<slug>.mdx.
 *
 * Accuracy guardrails (master.md §10): every number here must come from the
 * project notes. If a number changes, update this file and the resume together.
 *
 * Anything still waiting on the owner is listed in `openItems` (IDs match
 * master.md §9). Those render as amber "needs input" notes until removed.
 */

export type Vec3 = [number, number, number];

export type StationObject = "phone" | "raspberry-pi" | "esp32" | "l1-l2-stack";

export type Stat = { label: string; value: string; source?: string };

export type OpenItem = { id: string; note: string };

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  oneLiner: string;
  status: string;
  dates: string;
  role?: string;
  context?: string;
  tags: string[];
  /** All headline numbers. The first three are shown on the card. */
  stats: Stat[];
  links: { label: string; href: string }[];
  accent: string;
  station: {
    object: StationObject;
    position: Vec3;
    cameraTarget: Vec3;
  };
  media: { type: "image" | "video"; src: string; alt: string }[];
  openItems: OpenItem[];
};

export const projects: Project[] = [
  {
    slug: "fitos",
    title: "FITOS",
    shortTitle: "FITOS",
    oneLiner:
      "An AI-powered fitness, nutrition and running app for Android that plans your training, food and recovery from what you log.",
    status: "Closed beta (Android)",
    dates: "Sep 2026 – present",
    role: "Solo, full stack",
    tags: ["Flutter", "TypeScript", "Fastify", "PostgreSQL", "AWS", "Gemini"],
    stats: [
      { value: "185", label: "API endpoints · 71 tables · 49 migrations", source: "Generated OpenAPI spec and migration folder" },
      { value: "~1,300", label: "Flutter tests · 100% branch coverage on the training engine", source: "CI test reports" },
      { value: "222 ms", label: "p95 latency at 50 requests/second", source: "Load test" },
      { value: "30+", label: "beta releases, plus over-the-air patches", source: "Release history" },
      { value: "1,864", label: "Indian foods · 172 exercises with demos", source: "App database" },
    ],
    links: [
      { label: "tryfitos.me", href: "https://tryfitos.me" },
      { label: "GitHub", href: "https://github.com/Srijan1202/fitnew" },
    ],
    accent: "#4C7DFF",
    station: { object: "phone", position: [5, 0, 0], cameraTarget: [5, 0.9, 0] },
    media: [],
    openItems: [],
  },
  {
    slug: "thermal-aware-job-ordering",
    title: "Thermal-Aware Job Ordering on Edge Devices",
    shortTitle: "TDAS",
    oneLiner:
      "I tested whether running jobs in a smarter order keeps a fanless Raspberry Pi 4 cooler and makes its slowest jobs faster.",
    status: "Preregistered study · paper under review at ICEAMST 2026",
    dates: "Oct – Nov 2026",
    context: "VIT Vellore, under Dr. Padma Priya R (BCSE313L Fog and Edge Computing)",
    tags: ["Raspberry Pi 4", "Python", "Linux", "Statistics", "LaTeX"],
    stats: [
      { value: "24,000", label: "jobs over 40 controlled runs", source: "Run logs" },
      { value: "13.3 s → 0 s", label: "time above the throttling point, per run", source: "Firmware clock samples" },
      { value: "< 1 ms", label: "P99 latency change (0.44%), so the hypothesis was rejected", source: "Preregistered analysis" },
      { value: "80.8 °C", label: "throttling point, from 6,894 firmware clock samples", source: "Firmware clock samples" },
    ],
    links: [
      { label: "Findings site", href: "https://tdasweb.vercel.app" },
      { label: "GitHub (experiment)", href: "https://github.com/Srijan1202/fog" },
      { label: "GitHub (findings site)", href: "https://github.com/Srijan1202/tdas_web" },
    ],
    accent: "#FF6A3D",
    station: { object: "raspberry-pi", position: [11, 0, 0], cameraTarget: [11, 0.6, 0] },
    media: [],
    openItems: [],
  },
  {
    slug: "emotion-detection",
    title: "Adaptive Multi-Biosignal Emotion Detection System",
    shortTitle: "Emotion Detection",
    oneLiner:
      "A real-time emotion and stress detection device on an ESP32 that fuses heart-rate, motion and skin-conductance signals and responds with haptic feedback.",
    status: "Hardware prototype",
    dates: "2026",
    tags: ["Embedded C", "ESP32", "Signal Processing", "IoT"],
    stats: [
      { value: "< 600 KB", label: "SRAM footprint", source: "Build output" },
      { value: "3", label: "biosignals fused in real time", source: "Firmware" },
      { value: "4", label: "original modules: AWF, ETP, SAI, SMHR", source: "Design notes" },
      { value: "4", label: "feedback channels: haptic, visual, display, wireless dashboard", source: "Firmware" },
    ],
    links: [],
    accent: "#19C3B1",
    station: { object: "esp32", position: [17, 0, 0], cameraTarget: [17, 0.6, 0] },
    media: [
      {
        type: "image",
        src: "/images/emotion/breadboard.jpg",
        alt: "Breadboard prototype: ESP32 board, OLED display, MAX30102 heart-rate sensor, MPU6050 motion sensor, GSR module, coin vibration motor and LED",
      },
    ],
    openItems: [],
  },
  {
    slug: "l2-escape-bench",
    title: "L2 Escape Bench",
    shortTitle: "L2 Escape Bench",
    oneLiner:
      "A reproducible harness that measures what it costs to force a transaction onto a Layer-2 rollup through Ethereum L1, plus a full-history census of whether Arbitrum One's escape hatch has ever been usable.",
    status: "Experiment harness · testnet, devnet and mainnet measurements",
    dates: "2026",
    tags: ["TypeScript", "Python", "Ethereum", "Arbitrum", "OP Stack", "Statistics"],
    stats: [
      {
        value: "0 of 2,563,796",
        label: "Arbitrum One delayed messages ever left unread long enough to be forced",
        source: "Full-history mainnet census",
      },
      { value: "17.4%", label: "closest any message came to the force window, in ~4 years", source: "Full-history mainnet census" },
      { value: "100", label: "testnet runs, 25/25 successes in all 4 cells", source: "Public-testnet dataset" },
      { value: "766 s vs 76 s", label: "median L1 → L2 inclusion, Arbitrum Sepolia vs OP Sepolia", source: "Public-testnet dataset" },
      { value: "2 vs 1", label: "L1 transactions a user must send: Arbitrum vs OP Stack", source: "Deployed contract source" },
    ],
    links: [{ label: "GitHub", href: "https://github.com/Srijan1202/blockchain" }],
    accent: "#9B6BFF",
    station: { object: "l1-l2-stack", position: [23, 0, 0], cameraTarget: [23, 0.7, 0] },
    media: [],
    openItems: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function adjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? projects[i - 1] : undefined,
    next: i < projects.length - 1 ? projects[i + 1] : undefined,
  };
}
