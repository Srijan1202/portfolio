import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjacentProjects, getProject, projects } from "@/content/projects";
import { ProjectMeta, StatGrid, TagList } from "@/components/ProjectCard";
import { OpenItems } from "@/components/OpenItems";
import { ProjectModel } from "@/components/ProjectModel";
import { PrintButton } from "@/components/PrintButton";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.oneLiner,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: p.title, description: p.oneLiner, type: "article" },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { default: Body } = await import(`@/content/projects/${slug}.mdx`);
  const { prev, next } = adjacentProjects(slug);
  const index = projects.indexOf(project) + 1;

  return (
    <main className="relative" style={{ ["--accent" as string]: project.accent }}>
      {/* Accent glow behind the header */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60"
        style={{
          background: `radial-gradient(60% 100% at 70% 0%, color-mix(in srgb, ${project.accent} 22%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="text-sm text-faint">
          <Link href="/#projects" className="hover:text-text">
            ← All projects
          </Link>
        </nav>

        <header className="mt-8">
          <div className="md:grid md:grid-cols-[1fr_210px] md:items-center md:gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: project.accent }}>
                Station {String(index).padStart(2, "0")}
              </p>
              <h1 className="mt-2 font-display text-[1.9rem] font-bold leading-[1.1] tracking-tight text-text sm:text-5xl sm:leading-[1.08]">
                {project.title}
              </h1>
              <div className="mt-4">
                <ProjectMeta project={project} />
              </div>
              {project.context && <p className="mt-2 text-sm text-faint">{project.context}</p>}
            </div>
            <ProjectModel slug={project.slug} accent={project.accent} />
          </div>
          <p className="mt-5 text-lg leading-relaxed text-dim">{project.oneLiner}</p>

          <details className="no-print group mt-4 rounded-xl border border-line bg-white/[0.02] open:bg-white/[0.04]">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-text marker:hidden">
              <span aria-hidden className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
              Explain it in plain English
            </summary>
            <div className="space-y-2 px-4 pb-4 text-[15px] leading-relaxed text-dim">
              {project.plain.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </details>

          <div className="mt-6">
            <StatGrid stats={project.stats.slice(0, 3)} accent={project.accent} />
          </div>
          {project.stats.length > 3 && (
            <ul className="mt-3 space-y-1 text-sm text-dim">
              {project.stats.slice(3).map((s) => (
                <li key={s.label}>
                  <span className="font-medium text-text">{s.value}</span> {s.label}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <TagList tags={project.tags} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <PrintButton />
          </div>
          {project.links.length > 0 && (
            <div className="no-print mt-2 flex flex-wrap gap-2">
              {project.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg border border-line-strong px-3.5 py-2 text-sm text-text hover:border-[var(--accent)]"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
          <div className="mt-6">
            <OpenItems items={project.openItems} />
          </div>
        </header>

        <article className="prose-site mt-4">
          <Body />
        </article>

        <nav aria-label="More projects" className="mt-20 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="glass rounded-xl p-4 hover:border-line-strong">
              <span className="text-xs text-faint">← Previous</span>
              <span className="mt-1 block font-medium text-text">{prev.shortTitle}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="glass rounded-xl p-4 text-right hover:border-line-strong">
              <span className="text-xs text-faint">Next →</span>
              <span className="mt-1 block font-medium text-text">{next.shortTitle}</span>
            </Link>
          ) : (
            <Link href="/#contact" className="glass rounded-xl p-4 text-right hover:border-line-strong">
              <span className="text-xs text-faint">Next →</span>
              <span className="mt-1 block font-medium text-text">Get in touch</span>
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
