export interface TypeStyle {
  bg: string;
  text: string;
  ring: string;
  gradient: string;
}

const TYPE_STYLES: Record<string, TypeStyle> = {
  normal: {
    bg: "bg-stone-400",
    text: "text-white",
    ring: "ring-stone-400/40",
    gradient: "from-stone-300 to-stone-500",
  },
  fire: {
    bg: "bg-orange-500",
    text: "text-white",
    ring: "ring-orange-500/40",
    gradient: "from-orange-400 to-red-600",
  },
  water: {
    bg: "bg-blue-500",
    text: "text-white",
    ring: "ring-blue-500/40",
    gradient: "from-sky-400 to-blue-600",
  },
  electric: {
    bg: "bg-yellow-400",
    text: "text-stone-900",
    ring: "ring-yellow-400/40",
    gradient: "from-yellow-300 to-amber-500",
  },
  grass: {
    bg: "bg-emerald-500",
    text: "text-white",
    ring: "ring-emerald-500/40",
    gradient: "from-emerald-400 to-green-600",
  },
  ice: {
    bg: "bg-cyan-300",
    text: "text-stone-900",
    ring: "ring-cyan-300/40",
    gradient: "from-cyan-200 to-sky-400",
  },
  fighting: {
    bg: "bg-red-700",
    text: "text-white",
    ring: "ring-red-700/40",
    gradient: "from-red-600 to-rose-800",
  },
  poison: {
    bg: "bg-purple-600",
    text: "text-white",
    ring: "ring-purple-600/40",
    gradient: "from-purple-500 to-fuchsia-700",
  },
  ground: {
    bg: "bg-amber-600",
    text: "text-white",
    ring: "ring-amber-600/40",
    gradient: "from-amber-500 to-yellow-700",
  },
  flying: {
    bg: "bg-indigo-400",
    text: "text-white",
    ring: "ring-indigo-400/40",
    gradient: "from-indigo-300 to-sky-500",
  },
  psychic: {
    bg: "bg-pink-500",
    text: "text-white",
    ring: "ring-pink-500/40",
    gradient: "from-pink-400 to-rose-600",
  },
  bug: {
    bg: "bg-lime-500",
    text: "text-stone-900",
    ring: "ring-lime-500/40",
    gradient: "from-lime-400 to-green-600",
  },
  rock: {
    bg: "bg-yellow-700",
    text: "text-white",
    ring: "ring-yellow-700/40",
    gradient: "from-yellow-600 to-stone-700",
  },
  ghost: {
    bg: "bg-violet-700",
    text: "text-white",
    ring: "ring-violet-700/40",
    gradient: "from-violet-500 to-purple-800",
  },
  dragon: {
    bg: "bg-indigo-700",
    text: "text-white",
    ring: "ring-indigo-700/40",
    gradient: "from-indigo-600 to-violet-800",
  },
  dark: {
    bg: "bg-stone-700",
    text: "text-white",
    ring: "ring-stone-700/40",
    gradient: "from-stone-600 to-stone-900",
  },
  steel: {
    bg: "bg-slate-500",
    text: "text-white",
    ring: "ring-slate-500/40",
    gradient: "from-slate-400 to-slate-600",
  },
  fairy: {
    bg: "bg-pink-300",
    text: "text-stone-900",
    ring: "ring-pink-300/40",
    gradient: "from-pink-200 to-rose-400",
  },
};

const DEFAULT_STYLE: TypeStyle = {
  bg: "bg-stone-500",
  text: "text-white",
  ring: "ring-stone-500/40",
  gradient: "from-stone-400 to-stone-600",
};

export function typeStyle(typeName: string): TypeStyle {
  return TYPE_STYLES[typeName] ?? DEFAULT_STYLE;
}

export function typeOrder(typeName: string): number {
  const order = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy",
  ];
  const idx = order.indexOf(typeName);
  return idx === -1 ? 99 : idx;
}
