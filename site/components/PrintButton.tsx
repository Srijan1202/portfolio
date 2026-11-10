"use client";

/** Opens the browser's print dialog; the print stylesheet in globals.css turns the page into a clean one-pager. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-lg border border-line-strong px-3.5 py-2 text-sm text-text hover:border-[var(--accent)]"
    >
      Print / save as PDF
    </button>
  );
}
