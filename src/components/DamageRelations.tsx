import type { GroupedMatchups } from "@/lib/matchups";
import TypePill from "./TypePill";

interface Props {
  matchups: GroupedMatchups;
}

interface Row {
  label: string;
  badge: string;
  types: string[];
  bg: string;
  fg: string;
}

export default function DamageRelations({ matchups }: Props) {
  const rows: Row[] = [
    {
      label: "Weak",
      badge: "x4",
      types: matchups.weak4x,
      bg: "bg-red-700",
      fg: "text-white",
    },
    {
      label: "Weak",
      badge: "x2",
      types: matchups.weak2x,
      bg: "bg-orange-500",
      fg: "text-white",
    },
    {
      label: "Resist",
      badge: "x½",
      types: matchups.resist05x,
      bg: "bg-emerald-500",
      fg: "text-white",
    },
    {
      label: "Resist",
      badge: "x¼",
      types: matchups.resist025x,
      bg: "bg-emerald-700",
      fg: "text-white",
    },
    {
      label: "Immune",
      badge: "x0",
      types: matchups.immune,
      bg: "bg-stone-700",
      fg: "text-white",
    },
  ].filter((row) => row.types.length > 0);

  if (rows.length === 0) {
    return (
      <p className="pixel-mono text-base text-foreground/60">
        No notable type matchups.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-2 rounded-sm border-2 border-dex-black bg-surface px-2 py-1.5 shadow-pixel-sm"
        >
          <div
            className={`pixel-text flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-[8px] ${row.bg} ${row.fg} shadow-pixel-inset`}
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
          >
            <span className="tabular-nums">{row.badge}</span>
            <span>{row.label}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {row.types.map((t) => (
              <TypePill key={t} name={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
