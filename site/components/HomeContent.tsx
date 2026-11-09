import Link from "next/link";
import { projects } from "@/content/projects";
import {
  bio,
  certifications,
  education,
  experience,
  leadership,
  otherProjects,
  profile,
  skills,
} from "@/content/site";
import { ProjectCard, TagList } from "@/components/ProjectCard";
import { StationControls } from "@/components/StationControls";
import { Todo } from "@/components/OpenItems";

type Mode = "full" | "lite";

function SectionHeading({ kicker, title, id }: { kicker: string; title: string; id: string }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lamp">{kicker}</p>
      <h2 id={id} className="mt-2 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function Hero({ mode }: { mode: Mode }) {
  return (
    <section
      id="top"
      data-rail={mode === "full" ? 0 : undefined}
      aria-labelledby="hero-name"
      className={
        mode === "full"
          ? "pointer-events-none relative flex min-h-[calc(100svh-3.5rem)] items-end pb-16 sm:pb-20"
          : "relative pt-16 pb-10 sm:pt-24"
      }
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className={mode === "full" ? "pointer-events-auto max-w-xl" : "max-w-2xl"}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lamp">Portfolio · srijansri.tech</p>
          <h1
            id="hero-name"
            className="mt-3 font-display text-5xl font-bold leading-[1.02] tracking-tight text-text sm:text-6xl"
          >
            {profile.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-dim sm:text-xl">{profile.tagline}</p>
          <p className="mt-3 text-sm text-faint">
            {profile.status}
            {profile.lookingFor ? (
              <> · {profile.lookingFor}</>
            ) : (
              <>
                {" · "}
                <Todo id="O-8">roles you&apos;re open to</Todo>
              </>
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="#projects"
              className="rounded-lg bg-lamp px-4 py-2.5 text-sm font-semibold text-[#1a1206] transition-transform hover:-translate-y-px"
            >
              View projects
            </Link>
            <a href={profile.resume} className="rounded-lg border border-line-strong bg-bg/40 px-4 py-2.5 text-sm font-medium text-text hover:border-lamp">
              Resume
            </a>
            <a href={profile.github} className="rounded-lg border border-line-strong bg-bg/40 px-4 py-2.5 text-sm font-medium text-text hover:border-lamp">
              GitHub
            </a>
            <a href={profile.linkedin} className="rounded-lg border border-line-strong bg-bg/40 px-4 py-2.5 text-sm font-medium text-text hover:border-lamp">
              LinkedIn
            </a>
          </div>

          {/* Recruiter skim: all four projects visible above the fold. */}
          <nav aria-label="Projects" className="mt-8">
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {projects.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`#project-${p.slug}`}
                    className="glass group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:border-line-strong"
                  >
                    <span className="font-mono text-xs" style={{ color: p.accent }}>
                      0{i + 1}
                    </span>
                    <span className="text-text">{p.shortTitle}</span>
                    <span className="ml-auto truncate text-xs text-faint">{p.tags[0]}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          {mode === "full" && (
            <p className="mt-8 hidden text-xs text-faint sm:block" aria-hidden>
              Scroll to walk the desk · ← → to jump between stations
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Projects({ mode }: { mode: Mode }) {
  if (mode === "lite") {
    return (
      <section id="projects" aria-labelledby="projects-title" className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading kicker="Selected work" title="Four projects" id="projects-title" />
          <div className="grid gap-6 lg:grid-cols-2">
            {projects.map((p, i) => (
              <div key={p.slug} id={`project-${p.slug}`} className="scroll-mt-20">
                <ProjectCard project={p} index={i + 1} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="projects" aria-labelledby="projects-title">
      <h2 id="projects-title" className="sr-only">
        Four projects
      </h2>
      {projects.map((p, i) => (
        <div
          key={p.slug}
          id={`project-${p.slug}`}
          data-rail={i + 1}
          className="pointer-events-none flex min-h-[115svh] items-center py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="pointer-events-auto w-full max-w-[560px] lg:w-[46%]">
              <ProjectCard project={p} index={i + 1}>
                <StationControls slug={p.slug} />
              </ProjectCard>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function About({ mode }: { mode: Mode }) {
  return (
    <section
      id="about"
      data-rail={mode === "full" ? 5 : undefined}
      aria-labelledby="about-title"
      className="scroll-mt-14 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass rounded-2xl p-6 sm:p-10">
          <SectionHeading kicker="About & experience" title="End to end, measured properly" id="about-title" />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-lg leading-relaxed text-dim">{bio}</p>
              <div className="mt-8 rounded-xl border border-line p-4">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-faint">Education</p>
                <p className="mt-2 font-medium text-text">{education.degree}</p>
                <p className="text-sm text-dim">
                  {education.school} · {education.detail}
                </p>
              </div>
            </div>
            <ol className="relative space-y-6 border-l border-line pl-6">
              {experience.map((x) => (
                <li key={x.org} className="relative">
                  <span aria-hidden className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-lamp bg-bg" />
                  <h3 className="font-medium text-text">
                    {x.role}, {x.org}
                  </h3>
                  <p className="text-sm text-faint">
                    {x.place} · {x.dates}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-dim">{x.summary}</p>
                  <div className="mt-2">
                    <TagList tags={x.tags} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Skills({ mode }: { mode: Mode }) {
  return (
    <section
      id="skills"
      data-rail={mode === "full" ? 5 : undefined}
      aria-labelledby="skills-title"
      className="scroll-mt-14 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass rounded-2xl p-6 sm:p-10">
          <SectionHeading kicker="Skills" title="Only what the projects back up" id="skills-title" />
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {skills.map((g) => (
              <div key={g.group} className="border-t border-line pt-4">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Leadership({ mode }: { mode: Mode }) {
  return (
    <section
      id="leadership"
      data-rail={mode === "full" ? 5 : undefined}
      aria-labelledby="leadership-title"
      className="scroll-mt-14 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass rounded-2xl p-6 sm:p-10">
          <SectionHeading kicker="Leadership & certifications" title="Beyond the desk" id="leadership-title" />
          <div className="grid gap-8 lg:grid-cols-3">
            <ul className="space-y-5 lg:col-span-2">
              {leadership.map((l) => (
                <li key={l.title}>
                  <h3 className="font-medium text-text">{l.title}</h3>
                  <p className="text-sm text-faint">{l.dates}</p>
                  <p className="mt-1 text-[15px] text-dim">{l.detail}</p>
                </li>
              ))}
            </ul>
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-faint">Certifications</h3>
              <ul className="mt-3 space-y-2 text-[15px] text-dim">
                {certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-faint">Also built</h3>
              <ul className="mt-3 space-y-3">
                {otherProjects.map((o) => (
                  <li key={o.title}>
                    <p className="font-medium text-text">{o.title}</p>
                    <p className="mt-1 text-sm text-dim">{o.summary}</p>
                    <div className="mt-2">
                      <TagList tags={o.tags} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact({ mode }: { mode: Mode }) {
  const links = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "GitHub", value: "github.com/srijan1202", href: profile.github },
    { label: "LinkedIn", value: "linkedin.com/in/srijansrivastava1202", href: profile.linkedin },
    { label: "Resume", value: "Download PDF", href: profile.resume },
  ];
  return (
    <section
      id="contact"
      data-rail={mode === "full" ? 6 : undefined}
      aria-labelledby="contact-title"
      className={mode === "full" ? "pointer-events-none flex min-h-[100svh] scroll-mt-14 items-center py-20" : "scroll-mt-14 py-16"}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="glass pointer-events-auto w-full max-w-[520px] rounded-2xl p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lamp">Contact</p>
          <h2 id="contact-title" className="mt-2 font-display text-3xl font-semibold tracking-tight text-text">
            Let&apos;s talk
          </h2>
          <p className="mt-3 text-dim">The fastest way to reach me is email. I usually reply within a day.</p>
          <ul className="mt-6 divide-y divide-line border-y border-line font-mono text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="group flex items-center justify-between gap-4 py-3 hover:text-lamp">
                  <span className="text-faint">{l.label}</span>
                  <span className="truncate text-text group-hover:text-lamp">{l.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HomeContent({ mode }: { mode: Mode }) {
  return (
    <main className="relative z-10">
      <Hero mode={mode} />
      <Projects mode={mode} />
      <About mode={mode} />
      <Skills mode={mode} />
      <Leadership mode={mode} />
      <Contact mode={mode} />
    </main>
  );
}
