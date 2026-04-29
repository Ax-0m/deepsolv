"use client";

import { typeOrder, typeStyle } from "@/lib/typeColors";
import { formatPokemonName } from "@/lib/pokeapi";
import { useSounds } from "@/hooks/useSounds";

interface Props {
  types: string[];
  selected: string[];
  onToggle: (type: string) => void;
  onClear: () => void;
}

export default function TypeFilter({
  types,
  selected,
  onToggle,
  onClear,
}: Props) {
  const sorted = [...types].sort((a, b) => typeOrder(a) - typeOrder(b));
  const { play } = useSounds();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => {
          play("click");
          onClear();
        }}
        className={`pixel-text rounded-sm border-2 border-dex-black px-2 py-1 text-[8px] transition shadow-pixel-sm ${
          selected.length === 0
            ? "bg-dex-black text-yellow-300"
            : "bg-surface text-foreground/70 hover:bg-surface-muted"
        }`}
        aria-pressed={selected.length === 0}
        style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.25)" }}
      >
        All
      </button>
      {sorted.map((type) => {
        const isOn = selected.includes(type);
        const style = typeStyle(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => {
              play("click");
              onToggle(type);
            }}
            aria-pressed={isOn}
            className={`pixel-text rounded-sm border-2 border-dex-black px-2 py-1 text-[8px] shadow-pixel-sm transition ${
              isOn
                ? `${style.bg} ${style.text} shadow-pixel-inset`
                : "bg-surface text-foreground/70 hover:bg-surface-muted"
            }`}
            style={{ textShadow: isOn ? "1px 1px 0 rgba(0,0,0,0.4)" : "none" }}
          >
            {formatPokemonName(type)}
          </button>
        );
      })}
    </div>
  );
}
