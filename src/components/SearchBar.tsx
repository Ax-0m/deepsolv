"use client";

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by name...",
}: Props) {
  return (
    <div className="relative w-full">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/55"
        aria-hidden
      >
        ⌕
      </span>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pixel-mono h-11 w-full rounded-sm border-2 border-dex-black bg-surface pl-9 pr-10 text-base font-bold tracking-wide outline-none shadow-pixel-sm transition focus:bg-yellow-50 focus:shadow-pixel"
        aria-label="Search Pokémon"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="pixel-text absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm bg-foreground/10 text-[10px] text-foreground/70 transition hover:bg-foreground/20"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
