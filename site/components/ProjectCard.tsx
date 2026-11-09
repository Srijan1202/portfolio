import Link from "next/link";
import type { Project } from "@/content/projects";
import { OpenItems } from "@/components/OpenItems";

export function StatGrid({
  stats,
  accent,
  className = "",
}: {
  stats: Project["stats"];
  accent: string;
  className?: string;
}) {
  return (
    <dl className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${className}`}>
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-line bg-white/[0.02] p-3">
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <span className="block font-display text-xl font-semibold tracking-tight" style={{ color: accent }}>
              {s.value}
            </span>
            <span className="mt-1 block text-[13px] leading-snug text-dim">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {tags.map((t) => (
        <li key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-dim">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function ProjectMeta({ project }: { project: Project }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-faint">
      <span className="inline-flex items-center gap-1.5 text-dim">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: project.accent }} />
        {project.status}
      </span>
      <span>{project.dates}</span>
      {project.role && <span>{project.role}</span>}
    </p>
  );
}

/**
 * The project card used on the home page (over the 3D scene) and on /lite.
 * `index` is the station number (1-4).
 * `compact`: on phones, while the 3D scene runs, the card trims to the
 * essentials (one stat, no tags or external links) so the model stays visible
 * above it. The case study has everything.
 */
export function ProjectCard({
  project,
  index,
  children,
  headingLevel = "h3",
  compact = false,
}: {
  project: Project;
  index: number;
  children?: React.ReactNode;
  headingLevel?: "h2" | "h3";
  compact?: boolean;
}) {
  const H = headingLevel;
  const c = (cls: string) => (compact ? cls : "");
  return (
    <article
      className={`glass rounded-2xl p-5 shadow-2xl shadow-black/40 sm:p-6 ${c("scene-mobile:p-4")}`}
      style={{ ["--accent" as string]: project.accent }}
      aria-labelledby={`card-${project.slug}`}
    >
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em]" style={{ color: project.accent }}>
        Station {String(index).padStart(2, "0")}
      </p>
      <H id={`card-${project.slug}`} className="font-display text-2xl font-semibold leading-tight tracking-tight text-text sm:text-[1.7rem]">
        {project.title}
      </H>
      <div className="mt-2">
        <ProjectMeta project={project} />
      </div>
      <p className={`mt-3 text-[15px] leading-relaxed text-dim ${c("scene-mobile:line-clamp-3")}`}>{project.oneLiner}</p>
      <div className="mt-4">
        <StatGrid
          stats={project.stats.slice(0, 3)}
          accent={project.accent}
          className={c("scene-mobile:[&>*:nth-child(n+2)]:hidden")}
        />
      </div>
      <div className={`mt-4 ${c("scene-mobile:hidden")}`}>
        <TagList tags={project.tags} />
      </div>
      {children}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-[#0a0f1c] transition-transform hover:-translate-y-px"
          style={{ background: project.accent }}
        >
          Read the case study <span aria-hidden>→</span>
        </Link>
        {project.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`rounded-lg border border-line-strong px-3.5 py-2 text-sm text-text transition-colors hover:border-[var(--accent)] ${c("scene-mobile:hidden")}`}
          >
            {l.label} <span aria-hidden>↗</span>
          </a>
        ))}
      </div>
      <div className="mt-4">
        <OpenItems items={project.openItems} compact />
      </div>
    </article>
  );
}
