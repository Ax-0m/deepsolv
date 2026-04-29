"use client";

import { useSounds } from "@/hooks/useSounds";

export type SortKey =
  | "dex"
  | "name-asc"
  | "name-desc"
  | "stats-desc"
  | "stats-asc"
  | "height-desc"
  | "weight-desc";

interface Props {
  value: SortKey;
  onChange: (next: SortKey) => void;
}

const OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "dex", label: "Dex Order" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "stats-desc", label: "Strongest" },
  { value: "stats-asc", label: "Weakest" },
  { value: "height-desc", label: "Tallest" },
  { value: "weight-desc", label: "Heaviest" },
];

export default function SortDropdown({ value, onChange }: Props) {
  const { play } = useSounds();
  return (
    <label className="pixel-text inline-flex h-10 items-center gap-2 rounded-sm border-2 border-dex-black bg-surface px-2 text-[8px] shadow-pixel-sm">
      <span className="text-foreground/60">Sort</span>
      <select
        value={value}
        onChange={(e) => {
          play("click");
          onChange(e.target.value as SortKey);
        }}
        className="pixel-text cursor-pointer bg-transparent pr-1 text-[8px] outline-none focus:outline-none"
        aria-label="Sort Pokémon"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="pixel-text">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
