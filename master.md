# srijansri.tech: 3D Portfolio Website Spec

**Owner:** Srijan Srivastava · **Draft:** v1, 8 Nov 2026 · **Domain:** srijansri.tech

Anything in `[brackets]` still needs your input. Section 9 lists every open item in one place.

---

## 1. Goal

A 3D portfolio built around four main projects: **FITOS**, **Thermal-Aware Job Ordering (TDAS)**, the **Adaptive Multi-Biosignal Emotion Detection System** and **L2 Escape Bench**.

**Audiences**
- **Recruiters (30-second skim):** within 10 seconds they should find your name, what you build, the four projects, your resume and how to contact you. This has to work even if the 3D never loads.
- **Engineers and interviewers (deep dive):** each project has its own page with the architecture, numbers, challenges and links.

**Principle:** the 3D scene gives the site its character, but every word of content lives in normal HTML. The site still works with WebGL turned off.

---

## 2. 3D concept: "The Workbench"

A dark engineering desk at night, lit by one warm desk lamp. Four **stations** sit along the desk, one per project, and each holds a physical object that stands for that project. Scrolling moves the camera along a rail from station to station. Clicking an object opens that project's panel.

| # | Project | Object on the desk | Idle animation | Interaction |
|---|---|---|---|---|
| 1 | **FITOS** | An Android phone standing upright, with the app on screen. Four small rings float around it: Training, Nutrition, Running, AI Coach. | The phone screen cycles through app screenshots and the rings orbit slowly. | Hover a ring to pop out that feature's label. Click the phone to open the project. |
| 2 | **TDAS** | A bare, fanless Raspberry Pi 4 board with a thermometer line marked **80.8 °C**. | The SoC glows from cool blue to red and heat shimmer rises above the chip. | A toggle for the four job orders (hot-first, cool-first, alternating, random) changes the heat animation, with the real results shown beside it. |
| 3 | **Emotion Detection** | An ESP32 on a breadboard wired to a MAX30102, an MPU6050, a GSR sensor and an SSD1306 OLED. | An LED pulses like a heartbeat, the OLED shows a state label, and three signal traces (heart rate, motion, skin conductance) flow into a glowing fusion node. | Click a sensor to "unplug" it. Its trace goes noisy and the fusion weights rebalance on screen, which shows Adaptive Weighted Fusion degrading gracefully. |
| 4 | **L2 Escape Bench** | Two stacked layers of blocks: **L1 (Ethereum Sepolia)** below, and **L2 (OP Sepolia, Arbitrum Sepolia)** above. | A transaction capsule enters L2 through the sequencer. | A "take the sequencer offline" button blocks L2. The capsule drops to L1 and is then force-included back into L2. |

**Bookends**
- **Start:** your name as 3D text on the desk under the lamp, with a short tagline and a scroll hint.
- **End:** a contact station with a notebook or terminal that holds the links: email, GitHub, LinkedIn and resume.

**Mood:** dark navy and graphite, one warm key light, and one accent colour per project (for example FITOS cobalt, TDAS orange-red, Emotion teal, Escape Bench violet). Bloom is kept subtle, with no heavy post-processing.

**Honesty rule for the animations:** the animations are illustrations. Real numbers appear only in the HTML panels, and each is labelled with where it came from.

---

## 3. Site map

| Route | Content |
|---|---|
| `/` | Hero → 4 project stations → About & Experience → Skills → Leadership → Contact |
| `/projects/fitos` | FITOS detail page |
| `/projects/thermal-aware-job-ordering` | TDAS detail page |
| `/projects/emotion-detection` | Emotion Detection detail page |
| `/projects/l2-escape-bench` | Escape Bench detail page |
| `/lite` | Full 2D version with the same content (also served automatically when there's no WebGL) |
| `/resume.pdf` | Current resume |

The detail pages are normal 2D pages (MDX) so search engines can index them and links can be shared directly. A small 3D model of the project object can sit in the page header.

---

## 4. Content

### 4.1 Hero

- **Name:** Srijan Srivastava
- **Tagline (draft, edit freely):** "CS undergrad at VIT Vellore. I build full-stack apps, embedded systems and careful experiments."
- **Buttons:** View projects · Resume · GitHub · LinkedIn
- **Status line:** B.Tech CSE, VIT Vellore · Graduating July 2027 · [Open to internships / full-time roles in ___]

### 4.2 Project cards

Each card shows the title, a one-line summary, 3 headline numbers, tags, the date, status and links.

---

#### Project 1: FITOS, an AI fitness and nutrition app

- **One-liner:** An AI-powered fitness, nutrition and running app for Android that plans your training, food and recovery from what you log.
- **Status:** Closed beta, Android · **Dates:** Sep 2026 – present · **Role:** Solo, full stack
- **Links:** [tryfitos.me](https://tryfitos.me) · [GitHub repo, if public]
- **Tags:** Flutter · TypeScript · Fastify · PostgreSQL · AWS · Gemini
- **Headline numbers (choose 3 for the card):**
  - 185 API endpoints · 71 tables · 49 migrations
  - ~1,300 Flutter tests · 100% branch coverage on the training engine
  - p95 **222 ms** at 50 requests/second
  - 30+ beta releases, plus over-the-air patches
  - 1,864 Indian foods · 172 exercises with demos

**Detail page sections**

1. **What it is:** FITOS plans training, food and recovery from what you log. It covers a progressing training programme, Indian food and VIT mess menus, trend weight, recovery readiness, running, an AI coach and a social layer. It's a free Android beta, distributed from its own website with in-app updates.
2. **Architecture** (show as a diagram):
   - A monorepo with `apps/mobile` (Flutter), `apps/api` (Fastify), `apps/admin` (Next.js), and the shared packages `packages/core`, `packages/contracts` and `packages/config`.
   - `packages/core` (~11k lines of TypeScript) is a deterministic domain engine for training, recovery, nutrition, running and recommendations. The server is the source of truth.
   - Zod contracts → a generated OpenAPI spec (185 operations). CI fails when the spec drifts from the code.
   - PostgreSQL: 71 tables and 49 migrations, each with a tested rollback script.
   - Mobile: ~140k lines of Dart, 20 feature modules, Riverpod state, and a Drift local database.
3. **Features:** training engine (progressive overload, deloads, MEV/MAV/MRV volume) · nutrition (1,864-food database, mess menus, Gemini meal-photo logging) · progress & recovery · GPS running with MapLibre and Galaxy Watch support · Gemini AI coach with streaming · Community with friends, clubs and a leaderboard.
4. **Infrastructure:** CloudFormation, EC2 + Docker + Caddy, and RDS PostgreSQL in Mumbai. Deploys run through SSM with no SSH, GitHub OIDC pushes images to ECR, and Firebase uses keyless Workload Identity Federation. Google Cloud Run is a second, switchable target. *(See open item O-1.)*
5. **Quality:** 4 GitHub Actions pipelines, ~1,300 Flutter tests, API integration tests on an isolated database, an OpenAPI diff, a load test (p95 222 ms at 50 rps) and 58 ADRs.
6. **Privacy by design:** separate consent for each purpose, data export, cascading account deletion, and a community layer that shows counts only.
7. **Challenges I solved** (choose 3):
   - A tamper-proof leaderboard: the phone never sends a score, and the server counts from synced records using sanity rules.
   - Offline-first sync: a local queue with retries and a "Not synced yet" state, and totals that count only what the server confirmed.
   - A release-only launch crash: R8 code shrinking broke WorkManager. It was found, fixed and shipped as a hotfix the same day.
   - Keyless cloud security: OIDC and Workload Identity Federation, with no SSH deploys.
8. **Media needed:** 4–6 phone screenshots, a 20–30 second screen recording, and an architecture diagram.

---

#### Project 2: Thermal-Aware Job Ordering on Edge Devices (a preregistered study)

- **One-liner:** I tested whether running jobs in a smarter order keeps a fanless Raspberry Pi 4 cooler and makes its slowest jobs faster.
- **Status:** [Paper submitted / under review at ICEAMST 2026, RVCE Bengaluru — use the exact current status] · **Dates:** Oct – Nov 2026
- **Context:** VIT Vellore, under Dr. Padma Priya R (BCSE313L Fog and Edge Computing)
- **Links:** [Findings website] · [Paper PDF or preprint, if allowed] · [GitHub repo]
- **Tags:** Raspberry Pi 4 · Python · Linux · Statistics · LaTeX
- **Headline numbers (choose 3 for the card):**
  - **24,000 jobs** over 40 controlled runs
  - Time above the throttling point: **13.3 s → 0 s** per run
  - P99 latency changed by **< 1 ms (0.44%)**, so the hypothesis was rejected
  - Throttling point measured at **80.8 °C** from 6,894 firmware clock samples

**Detail page sections**

1. **Question:** does job ordering reduce thermal throttling and tail latency on a fanless edge device?
2. **Design:**
   - Matched HOT and COOL job types whose run times differ by 0.05% when the chip is cold.
   - Four orders (hot-first, cool-first, alternating, random) with 10 counterbalanced repetitions each.
   - A standard cool-down and a pre-heat to 77 °C before every run.
   - Preregistered hypotheses, tests and pass/fail gates, with 7 dated amendments.
3. **Measurement and systems work:**
   - `scaling_cur_freq` showed none of the throttling, a blind spot in the usual Linux tool, so throttling was read from firmware clock samples instead.
   - The safety monitor itself was causing stalls (8 of 8 matched its checks). It was redesigned to start no new processes.
   - Safety systems: an automatic stop at 85 °C, under-voltage detection, a 5 Hz temperature logger (23,843 samples) and hash-checked code on the device.
4. **Results** (interactive chart): latency against temperature. Jobs run at a flat ~196 ms below 80.8 °C and 208–212 ms when throttled, a slope of +0.208 ms/°C (95% CI [+0.070, +0.343]).
5. **Analysis:** bootstrap confidence intervals (10,000 resamples), Holm correction and Cliff's δ. An independent re-analysis matched every result to within 10⁻⁶.
6. **Why the result was negative, and what's next:** one-minute hot periods throttle only lightly, and only 2–3 of 600 jobs per run were slow. A follow-up would use longer hot periods.
7. **Write-up:** an 8-page IEEE-format paper in LaTeX with 7 figures and 3 tables. AI assistance is disclosed in the paper.
8. **Media needed:** a photo of the Pi setup, the temperature-trace figure, the latency-vs-temperature figure, and an embed of or link to the existing findings site.

---

#### Project 3: Adaptive Multi-Biosignal Emotion Detection System

- **One-liner:** A real-time emotion and stress detection device on an ESP32 that fuses heart-rate, motion and skin-conductance signals and responds with haptic feedback.
- **Status:** [Patent application with VIT Vellore — use the exact current status] · **Date:** 2026
- **Tags:** Embedded C · ESP32 · Signal Processing · IoT
- **Hardware:** ESP32, MAX30102 (heart rate), MPU6050 (motion), GSR sensor (skin conductance), SSD1306 OLED, haptic motor, LEDs
- **Links:** [GitHub repo] · [Demo video]
- **Headline numbers (choose 3 for the card):**
  - Runs in **< 600 KB SRAM**
  - **3 biosignals** fused in real time
  - **4 original modules:** AWF, ETP, SAI, SMHR
  - Haptic, visual, display and wireless dashboard feedback

**Detail page sections**

1. **Problem:** detecting stress in real time on cheap, resource-limited hardware, even when a sensor gives bad data.
2. **Architecture** (diagram): sensors → signal-quality checks → Adaptive Weighted Fusion → state estimate → feedback (haptics, LEDs, OLED, WiFi dashboard).
3. **The four modules:**
   - **Adaptive Weighted Fusion (AWF):** changes how much each sensor is trusted based on its signal quality, so the system degrades gracefully when a channel becomes unreliable.
   - **Emotional Trajectory Prediction (ETP):** detects stress proactively, before it peaks.
   - **[Stress Accumulation Integration / Index] (SAI):** models stress load over time.
   - **[Session Wellness Reporting / Session Mental Health Report] (SMHR):** produces a wellness assessment at the end of a session on the device.
4. **Feedback loop:** haptic intervention, visual indicators, the OLED, and the wireless monitoring dashboard.
5. **Hardware bring-up stories:**
   - Each component was brought up on its own to isolate faults.
   - A clone MPU6050 reports WHO_AM_I 0x70 instead of the expected value, so the driver had to accept it.
   - Flash partition corruption was traced to the breadboard wiring on the ESP32 boot-strapping pins.
6. **Media needed:** a photo of the breadboard, a short video of the haptic response, and a screenshot of the dashboard.

---

#### Project 4: L2 Escape Bench, a forced-inclusion experiment harness

- **One-liner:** A reproducible harness for testing how users can force their transactions onto a Layer-2 rollup through Ethereum L1 when the L2 sequencer isn't working.
- **Status:** [Complete / ongoing] · **Date:** 2026
- **Tags:** Python · Ethereum · Arbitrum · OP Stack · Sepolia
- **Links:** [GitHub repo] · [Write-up or results, if any]
- **Headline numbers:** [needed, for example the number of experiments run, rollups tested (2), median forced-inclusion delay on each, and number of tests]

**Detail page sections**

1. **Why it matters:** rollups rely on a sequencer. If it censors or goes down, users need a way to get their transactions in through L1 (an escape hatch). This harness measures how that works in practice.
2. **What I built:**
   - CLI-driven experiment workflows: transaction submission, RPC interaction, environment-based configuration, experiment validation and automated tests.
   - Support for both OP Sepolia and Arbitrum Sepolia, so the two escape mechanisms can be compared.
3. **Experiments:** controlled runs that submit through L1 and measure L2 inclusion while normal sequencing is unavailable.
4. **Results:** [Needed. What did you find? Inclusion times, differences between OP Stack and Arbitrum, any surprises.]
5. **Media needed:** a terminal recording of a run, a diagram of the L1 → L2 forced-inclusion path, and a results table or chart.

---

### 4.3 About & Experience

- **Bio (draft, about 60 words):** "I'm a third-year CSE student at VIT Vellore. I like projects that go end to end: a mobile app that's actually in testers' hands, an experiment with preregistered stats, or a sensor board that has to work in under 600 KB of memory. I care about measuring things properly and shipping things that work."
- **Experience:**
  - **Frontend Engineer Intern, ExpLocal** (Vellore, Aug – Oct 2025): reusable React components for a travel marketplace, about 25% faster page loads, and REST API integration. React, Tailwind, TypeScript.
  - **Business Analyst Intern, Lok Mitra Venture** (Remote, 2026): requirements analysis, functional specs with traceability, and SQL/Excel KPI dashboards for non-technical stakeholders.
- **Education:** B.Tech CSE, VIT Vellore, CGPA 8.35/10, expected July 2027.

### 4.4 Skills

Show only the skills the projects back up, grouped, so the list stays credible. Link each skill to the project that proves it.

| Group | Skills | Proven by |
|---|---|---|
| Mobile | Flutter, Dart, Riverpod, Drift/SQLite, Health Connect, MapLibre | FITOS |
| Backend | TypeScript, Node.js, Fastify, PostgreSQL, Zod/OpenAPI | FITOS |
| Web | Next.js, React, Tailwind | FITOS admin, ExpLocal |
| Cloud/DevOps | AWS (EC2, RDS, ECR, SSM, CloudFormation), Docker, GitHub Actions, OIDC | FITOS |
| AI | Google Gemini (streaming, vision), prompt guard rails | FITOS |
| Embedded | Embedded C, ESP32, I²C sensors, signal processing | Emotion Detection |
| Systems & research | Python, Linux internals, Raspberry Pi, benchmarking, bootstrap/Holm/Cliff's δ, LaTeX | TDAS |
| Blockchain | Ethereum, OP Stack, Arbitrum, RPC | L2 Escape Bench |
| Other languages | Java, C++, Go, SQL, Bash | Coursework / resume |
| AI-assisted development | Claude / Claude Code, used for code, analysis and drafting | TDAS (disclosed), FITOS |

### 4.5 Leadership & Certifications

- **ACM VIT, Senior Inner Core Member** (2024 – present): organised Cryptic Hunt '24.
- **IEEE Computer Society VIT, Core Member** (2024 – present): organised Hack Battle '24 (300+ participants) and mentored 20 peers in web development.
- **IBM DevOps and Software Engineering Professional Certificate.**

### 4.6 Other projects (small strip under the main four, optional)

- **Pulse:** a desktop performance-optimisation platform (Electron, React, C#, ASP.NET Core) that switches performance profiles when heavy apps launch.

### 4.7 Contact

Email: srijan.srivastava1202@gmail.com · GitHub: github.com/srijan1202 · LinkedIn: linkedin.com/in/srijansrivastava1202 · Resume download.
Keep your phone number off the public site.

---

## 5. Tech stack: Next.js

The whole site is one **Next.js** app (App Router, TypeScript). The 3D scene runs inside it as a client component; everything else is server-rendered or statically generated by Next.js.

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16, App Router** + React 19 + TypeScript | Same versions as the FITOS admin panel |
| Rendering | Static generation (`generateStaticParams` for `/projects/[slug]`) | Every page is prebuilt HTML, so it's fast and indexable |
| 3D | **React Three Fiber** + **drei** + three.js, inside a `"use client"` component | Loaded with `next/dynamic` and `ssr: false`, so the 3D never blocks the first paint |
| Animation | drei `ScrollControls` + **GSAP** for the camera rail; Framer Motion for the 2D panels | |
| Models | Built from primitives in code first; swap in **Blender → glTF** (Draco/meshopt compressed) later, served from `/public/models` | |
| Effects | `@react-three/postprocessing`, subtle bloom only | |
| Content | **MDX** via `@next/mdx` for project pages, plus one `content/projects.ts` data file | One source for the cards, the 3D labels and the detail pages |
| Styling | Tailwind CSS | |
| Images & fonts | `next/image`, `next/font` | |
| SEO | Next.js Metadata API, `opengraph-image.tsx` per project, `sitemap.ts`, `robots.ts` | |
| Charts | A small SVG or Recharts chart on the TDAS and FITOS pages | |
| Hosting | **Vercel** (built for Next.js, free tier, custom domain srijansri.tech) | Alternative: `output: "export"` and serve the static files from any host |
| Analytics | [Optional: Vercel Analytics, Plausible or Umami] | |

### Project structure

```
srijansri-tech/
├── app/
│   ├── layout.tsx              # fonts, metadata, nav
│   ├── page.tsx                # hero + 3D workbench + sections
│   ├── projects/[slug]/
│   │   ├── page.tsx            # detail page rendered from MDX
│   │   └── opengraph-image.tsx
│   ├── lite/page.tsx           # 2D fallback
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── three/                  # all "use client"
│   │   ├── Workbench.tsx       # Canvas, lights, ScrollControls
│   │   ├── CameraRail.tsx
│   │   └── stations/           # Phone.tsx, RaspberryPi.tsx, Esp32.tsx, L1L2Stack.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectPanel.tsx
│   └── WebGLGate.tsx           # detects WebGL / low-end / reduced motion
├── content/
│   ├── projects.ts
│   └── projects/*.mdx          # fitos, thermal-aware-job-ordering, emotion-detection, l2-escape-bench
├── public/
│   ├── models/  images/  videos/
│   └── resume.pdf
└── next.config.ts
```

---

## 6. Performance & accessibility

- **Content first:** the hero text and project cards render as HTML immediately. The 3D canvas lazy-loads afterwards.
- **Budgets:** LCP under 2.5 s, total 3D assets under 3 MB, 60 fps on desktop, 30+ fps on mid-range phones. Cap the device pixel ratio at 1.5.
- **Fallbacks:**
  - No WebGL or a low-end device → `/lite`.
  - Mobile → a simplified scene (fewer lights, no post-processing) or stacked 2D cards with small 3D thumbnails.
  - `prefers-reduced-motion` → a static camera with no auto-animations.
- **Accessibility:** every 3D object has an HTML equivalent. The stations can be reached with the keyboard (Tab / ← →), focus is visible, text contrast is AA, and images have alt text.
- **SEO:** Open Graph image per project, meta descriptions, and a sitemap.

---

## 7. Data model

```ts
// content/projects.ts
export type Project = {
  slug: string;                 // "fitos"
  title: string;
  oneLiner: string;
  status: string;               // exact wording, e.g. "Closed beta (Android)"
  dates: string;                // "Sep 2026 – present"
  role?: string;                // "Solo, full stack"
  tags: string[];
  stats: { label: string; value: string; source?: string }[]; // 3 shown on the card
  links: { label: string; href: string }[];
  accent: string;               // hex colour for the station
  station: {
    object: "phone" | "raspberry-pi" | "esp32" | "l1-l2-stack";
    position: [number, number, number];
    cameraTarget: [number, number, number];
  };
  media: { type: "image" | "video"; src: string; alt: string }[];
};
```

---

## 8. Build plan

1. **2D site first:** all content, the 4 detail pages, `/lite` and the resume. It can be published and used on its own.
2. **3D skeleton:** the desk, the lamp, the camera rail and placeholder boxes for each station, wired to the HTML panels.
3. **Station objects:** the phone, Pi, ESP32 and L1/L2 stack, plus their idle animations.
4. **Interactions:** the job-order toggle, unplugging a sensor, the sequencer-offline button and the FITOS rings.
5. **Polish:** performance pass, mobile and reduced-motion fallbacks, accessibility check, OG images, deploy.

---

## 9. Open items to fill in

| ID | Item |
|---|---|
| O-1 | **FITOS hosting is described two ways.** The resume says Docker on Google Cloud Run + Neon PostgreSQL; the project notes say AWS (EC2 + RDS) as production, with Cloud Run as a switchable second target. Pick the current truth and use it on the site and the resume. |
| O-2 | **TDAS paper status** (submitted / under review / accepted), and whether the paper PDF can be shared. |
| O-3 | **Patent status** for the Emotion Detection system (in preparation / filed / application number published). Write "patent pending" only if it has been filed. |
| O-4 | **Emotion module names:** the resume says "Stress Accumulation Integration" and "Session Wellness Reporting (SMHR)"; earlier notes say "Stress Accumulation Index" and "Session Mental Health Report". Pick one set. |
| O-5 | **L2 Escape Bench results** and numbers: experiments run, inclusion delays, findings. Also the repo link. |
| O-6 | GitHub repo links for each project, and whether each repo is public. |
| O-7 | Screenshots, photos and videos for each project (see "Media needed" under each). |
| O-8 | Hero tagline and the roles you're targeting. |
| O-9 | Hosting: Vercel is the default. Say if srijansri.tech has to stay on its current host. |
| O-10 | Any reference sites whose look you like. |

---

## 10. Accuracy guardrails

- **FITOS:** say "closed beta". It's on 7 devices today, so don't suggest a large user base.
- **TDAS:** state the paper status exactly. Don't say "published" until it appears in IEEE Xplore.
- **Patent:** use the exact status (see O-3).
- **AI assistance:** keep the AI-assisted development line. The TDAS paper discloses it, so the site should match.
- **Numbers:** every number on the site comes from the project notes. If a number changes, update `projects.ts` and the resume together.