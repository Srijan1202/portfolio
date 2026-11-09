import type { OpenItem } from "@/content/projects";

/**
 * Amber "needs input" notes for content the owner still has to confirm
 * (IDs from master.md §9). Remove an item from content/projects.ts once filled
 * and the note disappears.
 */
export function OpenItems({ items, compact = false }: { items: OpenItem[]; compact?: boolean }) {
  if (items.length === 0) return null;
  if (compact) {
    return (
      <p className="text-xs text-todo">
        <span aria-hidden>◆ </span>
        {items.length} item{items.length > 1 ? "s" : ""} need input ({items.map((i) => i.id).join(", ")})
      </p>
    );
  }
  return (
    <aside
      aria-label="Content still to confirm"
      className="rounded-lg border border-dashed border-todo/50 bg-todo/5 p-4 text-sm"
    >
      <p className="mb-2 font-medium text-todo">Needs input before launch</p>
      <ul className="space-y-1.5 text-dim">
        {items.map((i) => (
          <li key={i.id + i.note}>
            <span className="mr-2 font-mono text-xs text-todo">{i.id}</span>
            {i.note}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Inline placeholder for a single missing fact inside prose. */
export function Todo({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span className="rounded border border-dashed border-todo/60 bg-todo/10 px-1.5 py-0.5 text-[0.9em] text-todo">
      <span className="mr-1 font-mono text-xs">{id}</span>
      {children}
    </span>
  );
}
