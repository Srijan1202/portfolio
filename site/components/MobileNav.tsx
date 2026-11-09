"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/** Section menu for phones. The desktop header shows the same links inline. */
export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-dim hover:text-text"
      >
        Menu
        <span aria-hidden className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={id}
          className="glass absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl py-1 shadow-2xl shadow-black/50"
        >
          {items.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-[15px] text-text hover:bg-white/5"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
