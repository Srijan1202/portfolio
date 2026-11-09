"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getProject } from "@/content/projects";
import { useSite } from "@/lib/store";
import { TagList, ProjectMeta } from "@/components/ProjectCard";

/** Side panel opened by clicking a station object in the 3D scene. */
export function ProjectPanel() {
  const slug = useSite((s) => s.panel);
  const set = useSite((s) => s.set);
  const ref = useRef<HTMLDialogElement>(null);
  const project = slug ? getProject(slug) : undefined;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (project && !d.open) d.showModal();
    if (!project && d.open) d.close();
  }, [project]);

  return (
    <dialog
      ref={ref}
      onClose={() => set({ panel: null })}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      aria-labelledby="panel-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-md border-l border-line bg-raised p-0 text-text backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      {project && (
        <div className="flex h-full flex-col overflow-y-auto p-6" style={{ ["--accent" as string]: project.accent }}>
          <div className="flex items-start justify-between gap-4">
            <h2 id="panel-title" className="font-display text-2xl font-semibold leading-tight">
              {project.title}
            </h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="rounded-md border border-line px-2.5 py-1 text-sm text-dim hover:text-text"
              aria-label="Close panel"
            >
              Esc
            </button>
          </div>
          <div className="mt-2">
            <ProjectMeta project={project} />
          </div>
          <p className="mt-4 leading-relaxed text-dim">{project.oneLiner}</p>

          <h3 className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-faint">Headline numbers</h3>
          <dl className="mt-3 space-y-3">
            {project.stats.map((s) => (
              <div key={s.label} className="border-l-2 pl-3" style={{ borderColor: project.accent }}>
                <dt className="font-display text-lg font-semibold" style={{ color: project.accent }}>
                  {s.value}
                </dt>
                <dd className="text-sm text-dim">
                  {s.label}
                  {s.source && <span className="block text-xs text-faint">Source: {s.source}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <TagList tags={project.tags} />
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-8">
            <Link
              href={`/projects/${project.slug}`}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[#0a0f1c]"
              style={{ background: project.accent }}
            >
              Read the case study →
            </Link>
            {project.links.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg border border-line-strong px-3.5 py-2 text-sm">
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}
