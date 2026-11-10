"use client";

import Link from "next/link";
import { useState } from "react";
import { projects } from "@/content/projects";
import { roles, type SkillGroup } from "@/content/site";

/** The skills list, with a role filter that highlights what backs each kind of role. */
export function SkillsGrid({ skills }: { skills: SkillGroup[] }) {
  const [role, setRole] = useState<string | null>(null);
  const active = roles.find((r) => r.id === role);
  const evidence = active ? projects.filter((p) => active.projects.includes(p.slug)) : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-faint">Hiring for:</span>
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={role === r.id}
            onClick={() => setRole(role === r.id ? null : r.id)}
            className="rounded-full border border-line-strong px-3 py-1 text-sm text-dim transition-colors hover:text-text aria-pressed:border-lamp aria-pressed:bg-lamp/15 aria-pressed:text-text"
          >
            {r.id}
          </button>
        ))}
      </div>
      <p className="mb-6 min-h-[1.5em] text-sm text-dim" aria-live="polite">
        {active && (
          <>
            Best evidence for {active.id.toLowerCase()} roles:{" "}
            {evidence.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && ", "}
                <Link href={`/projects/${p.slug}`} className="text-text underline decoration-line-strong underline-offset-2 hover:decoration-lamp">
                  {p.shortTitle}
                </Link>
              </span>
            ))}
            .
          </>
        )}
      </p>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {skills.map((g) => {
          const dim = active && !active.groups.includes(g.group);
          return (
            <div key={g.group} className={`border-t pt-4 transition-opacity ${dim ? "border-line opacity-35" : active ? "border-lamp/60" : "border-line"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium text-text">{g.group}</h3>
                <p className="text-xs text-faint">
                  Proven by{" "}
                  {g.provenBy.map((p, i) => (
                    <span key={p.label}>
                      {i > 0 && ", "}
                      {p.href ? (
                        <Link href={p.href} className="text-dim underline decoration-line-strong underline-offset-2 hover:text-text">
                          {p.label}
                        </Link>
                      ) : (
                        p.label
                      )}
                    </span>
                  ))}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-dim">{g.skills.join(" · ")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
