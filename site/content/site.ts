/** Non-project content for the home page and /lite (master.md §4). */

export const SITE_URL = "https://srijansri.tech";

export const profile = {
  name: "Srijan Srivastava",
  tagline:
    "CS undergrad at VIT Vellore. I build full-stack apps, embedded systems and careful experiments.",
  status: "B.Tech CSE, VIT Vellore · Graduating July 2027",
  lookingFor: "Open to software engineering roles",
  /** One line on what's current. Shown in the hero; update it as things change. */
  now: "FITOS is in closed beta on Android · the TDAS paper is under review at ICEAMST 2026",
  email: "srijan.srivastava1202@gmail.com",
  github: "https://github.com/srijan1202",
  linkedin: "https://www.linkedin.com/in/srijansrivastava1202",
  resume: "/resume.pdf",
};

export const bio =
  "I'm a final-year CSE student at VIT Vellore. I like projects that go end to end: a mobile app that's actually in testers' hands, an experiment with preregistered stats, or a sensor board that has to work in under 600 KB of memory. I care about measuring things properly and shipping things that work.";

export const experience = [
  {
    role: "Frontend Engineer Intern",
    org: "ExpLocal",
    place: "Vellore",
    dates: "Aug – Oct 2025",
    summary:
      "Built reusable React components for a travel marketplace, cut page loads by about 25%, and integrated REST APIs.",
    tags: ["React", "Tailwind", "TypeScript"],
  },
  {
    role: "Business Analyst Intern",
    org: "Lok Mitra Venture",
    place: "Remote",
    dates: "2026",
    summary:
      "Requirements analysis, functional specs with traceability, and SQL/Excel KPI dashboards for non-technical stakeholders.",
    tags: ["SQL", "Excel", "Requirements"],
  },
];

export const education = {
  degree: "B.Tech Computer Science and Engineering",
  school: "VIT Vellore",
  detail: "CGPA 8.35/10 · Expected July 2027",
};

export type SkillGroup = {
  group: string;
  skills: string[];
  provenBy: { label: string; href?: string }[];
};

export const skills: SkillGroup[] = [
  { group: "Mobile", skills: ["Flutter", "Dart", "Riverpod", "Drift/SQLite", "Health Connect", "MapLibre"], provenBy: [{ label: "FITOS", href: "/projects/fitos" }] },
  { group: "Backend", skills: ["TypeScript", "Node.js", "Fastify", "PostgreSQL", "Zod/OpenAPI"], provenBy: [{ label: "FITOS", href: "/projects/fitos" }] },
  { group: "Web", skills: ["Next.js", "React", "Tailwind"], provenBy: [{ label: "FITOS admin", href: "/projects/fitos" }, { label: "ExpLocal" }] },
  { group: "Cloud/DevOps", skills: ["AWS (EC2, RDS, ECR, SSM, CloudFormation)", "Docker", "GitHub Actions", "OIDC"], provenBy: [{ label: "FITOS", href: "/projects/fitos" }] },
  { group: "AI", skills: ["Google Gemini (streaming, vision)", "Prompt guard rails"], provenBy: [{ label: "FITOS", href: "/projects/fitos" }] },
  { group: "Embedded", skills: ["Embedded C", "ESP32", "I²C sensors", "Signal processing"], provenBy: [{ label: "Emotion Detection", href: "/projects/emotion-detection" }] },
  { group: "Systems & research", skills: ["Python", "Linux internals", "Raspberry Pi", "Benchmarking", "Bootstrap / Holm / Cliff's δ", "LaTeX"], provenBy: [{ label: "TDAS", href: "/projects/thermal-aware-job-ordering" }] },
  { group: "Blockchain", skills: ["Ethereum", "OP Stack", "Arbitrum", "TypeScript", "RPC"], provenBy: [{ label: "L2 Escape Bench", href: "/projects/l2-escape-bench" }] },
  { group: "Other languages", skills: ["Java", "C++", "Go", "SQL", "Bash"], provenBy: [{ label: "Coursework / resume" }] },
  { group: "AI-assisted development", skills: ["Claude / Claude Code for code, analysis and drafting"], provenBy: [{ label: "TDAS (disclosed)", href: "/projects/thermal-aware-job-ordering" }, { label: "FITOS", href: "/projects/fitos" }] },
];

export const leadership = [
  { title: "ACM VIT, Senior Inner Core Member", dates: "2024 – present", detail: "Organised Cryptic Hunt '24." },
  { title: "IEEE Computer Society VIT, Core Member", dates: "2024 – present", detail: "Organised Hack Battle '24 (300+ participants) and mentored 20 peers in web development." },
];

export const certifications = ["IBM DevOps and Software Engineering Professional Certificate"];

export const otherProjects = [
  {
    title: "Pulse",
    summary:
      "A desktop performance-optimisation platform that switches performance profiles when heavy apps launch.",
    tags: ["Electron", "React", "C#", "ASP.NET Core"],
  },
];

/** Role filter in the Skills section: which skill groups and projects back each kind of role. */
export const roles: { id: string; groups: string[]; projects: string[] }[] = [
  { id: "Backend", groups: ["Backend", "Cloud/DevOps", "AI"], projects: ["fitos", "l2-escape-bench"] },
  { id: "Mobile", groups: ["Mobile", "AI"], projects: ["fitos"] },
  { id: "Embedded", groups: ["Embedded", "Systems & research"], projects: ["emotion-detection", "thermal-aware-job-ordering"] },
  { id: "Research", groups: ["Systems & research", "Blockchain"], projects: ["thermal-aware-job-ordering", "l2-escape-bench"] },
];
