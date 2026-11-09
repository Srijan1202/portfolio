import Link from "next/link";
import { profile } from "@/content/site";

const nav = [
  { href: "/#projects", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-display text-[15px] font-semibold tracking-tight text-text">
          {profile.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hidden rounded-md px-2.5 py-1.5 text-dim transition-colors hover:text-text sm:inline-block"
            >
              {n.label}
            </Link>
          ))}
          <a
            href={profile.resume}
            className="ml-1 rounded-md border border-line-strong px-3 py-1.5 font-medium text-text transition-colors hover:border-lamp hover:text-lamp"
          >
            Resume
          </a>
        </nav>
      </div>
    </header>
  );
}
