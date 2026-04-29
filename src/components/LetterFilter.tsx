"use client";

import { useSounds } from "@/hooks/useSounds";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  selected: string | null;
  onSelect: (letter: string | null) => void;
}

export default function LetterFilter({ selected, onSelect }: Props) {
  const { play } = useSounds();
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => {
          play("click");
          onSelect(null);
        }}
        aria-pressed={selected === null}
        className={`pixel-text rounded-sm border-2 border-dex-black px-2 py-1 text-[8px] shadow-pixel-sm transition ${
          selected === null
            ? "bg-dex-black text-yellow-300"
            : "bg-surface text-foreground/70 hover:bg-surface-muted"
        }`}
      >
        A-Z
      </button>
      {LETTERS.map((letter) => {
        const active = selected === letter;
        return (
          <button
            key={letter}
            type="button"
            onClick={() => {
              play("click");
              onSelect(active ? null : letter);
            }}
            aria-pressed={active}
            className={`pixel-text grid h-7 w-7 place-items-center rounded-sm border-2 border-dex-black text-[10px] shadow-pixel-sm transition ${
              active
                ? "bg-dex-red text-white shadow-pixel-inset"
                : "bg-surface text-foreground/75 hover:bg-surface-muted"
            }`}
            style={{ textShadow: active ? "1px 1px 0 rgba(0,0,0,0.4)" : "none" }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
