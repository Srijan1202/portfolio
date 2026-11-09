import Link from "next/link";
import { profile } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© 2026 {profile.name} · srijansri.tech</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href={`mailto:${profile.email}`} className="hover:text-text">Email</a>
          <a href={profile.github} className="hover:text-text">GitHub</a>
          <a href={profile.linkedin} className="hover:text-text">LinkedIn</a>
          <Link href="/lite" className="hover:text-text">2D version</Link>
        </div>
      </div>
    </footer>
  );
}
