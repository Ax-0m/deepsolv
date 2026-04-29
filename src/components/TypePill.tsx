import { typeStyle } from "@/lib/typeColors";
import { formatPokemonName } from "@/lib/pokeapi";

interface Props {
  name: string;
  size?: "sm" | "md";
}

export default function TypePill({ name, size = "sm" }: Props) {
  const style = typeStyle(name);
  const sizing =
    size === "sm"
      ? "px-2 py-0.5 text-[8px]"
      : "px-2.5 py-1 text-[10px]";
  return (
    <span
      className={`${style.bg} ${style.text} ${sizing} pixel-text inline-flex items-center justify-center rounded-sm font-normal shadow-pixel-inset`}
      style={{
        textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
      }}
    >
      {formatPokemonName(name)}
    </span>
  );
}
