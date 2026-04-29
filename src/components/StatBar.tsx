import { formatStatName } from "@/lib/pokeapi";

interface Props {
  name: string;
  value: number;
  max?: number;
}

const SEGMENTS = 16;

export default function StatBar({ name, value, max = 200 }: Props) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const filled = Math.round((percent / 100) * SEGMENTS);
  const tone =
    percent >= 75
      ? "bg-emerald-500"
      : percent >= 50
        ? "bg-amber-400"
        : percent >= 25
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="pixel-text w-20 text-[8px] text-foreground/70">
        {formatStatName(name)}
      </div>
      <div className="pixel-mono w-10 text-right text-base font-bold leading-none tabular-nums text-foreground/90">
        {value}
      </div>
      <div className="relative flex flex-1 items-center gap-[2px] rounded-sm border-2 border-dex-black bg-dex-screen-dark/80 p-[2px]">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-[1px] ${
              i < filled ? tone : "bg-dex-screen-dark/40"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
