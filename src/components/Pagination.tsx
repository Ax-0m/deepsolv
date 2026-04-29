"use client";

import { useSounds } from "@/hooks/useSounds";

interface Props {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  const { play } = useSounds();
  if (totalPages <= 1) return null;
  const items = pageWindow(page, totalPages);

  const handleClick = (next: number) => {
    play("click");
    onChange(next);
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => handleClick(Math.max(1, page - 1))}
        disabled={page === 1}
        className="pixel-btn rounded-sm bg-surface px-3 py-2 text-[8px] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ◄ PREV
      </button>
      <ul className="flex items-center gap-1">
        {items.map((p, i) =>
          p === "…" ? (
            <li
              key={`ellipsis-${i}`}
              className="pixel-text px-1 text-[10px] text-foreground/50"
              aria-hidden
            >
              ...
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => handleClick(p)}
                aria-current={p === page ? "page" : undefined}
                className={`pixel-text grid h-9 min-w-9 place-items-center rounded-sm border-2 border-dex-black px-2 text-[10px] shadow-pixel-sm transition ${
                  p === page
                    ? "bg-dex-red text-white shadow-pixel-inset"
                    : "bg-surface text-foreground hover:bg-surface-muted"
                }`}
                style={{
                  textShadow: p === page ? "1px 1px 0 rgba(0,0,0,0.4)" : "none",
                }}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        onClick={() => handleClick(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="pixel-btn rounded-sm bg-surface px-3 py-2 text-[8px] disabled:cursor-not-allowed disabled:opacity-40"
      >
        NEXT ►
      </button>
    </nav>
  );
}
