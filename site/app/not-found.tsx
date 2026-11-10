import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/content/projects";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-24 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lamp">404 · cable unplugged</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-text">This station isn&apos;t on the desk</h1>
      <p className="mt-4 text-dim">The page you were looking for doesn&apos;t exist. These do:</p>
      <ul className="mt-6 space-y-2">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/projects/${p.slug}`}
              className="glass flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:border-line-strong"
            >
              <span className="font-mono text-xs" style={{ color: p.accent }}>
                0{i + 1}
              </span>
              <span className="text-text">{p.shortTitle}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="mt-8 inline-block w-fit rounded-lg bg-lamp px-4 py-2.5 text-sm font-semibold text-[#1a1206]">
        Back to the desk
      </Link>
    </main>
  );
}
