import type { TypeData } from "./types";

export type Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

export interface MatchupResult {
  type: string;
  multiplier: Multiplier;
}

export interface GroupedMatchups {
  weak4x: string[];
  weak2x: string[];
  resist05x: string[];
  resist025x: string[];
  immune: string[];
}

const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export function computeDefensiveMatchups(defenderTypes: TypeData[]): MatchupResult[] {
  const multipliers = new Map<string, number>();
  for (const atk of ALL_TYPES) multipliers.set(atk, 1);

  for (const defenderType of defenderTypes) {
    const dr = defenderType.damage_relations;
    for (const t of dr.double_damage_from) {
      multipliers.set(t.name, (multipliers.get(t.name) ?? 1) * 2);
    }
    for (const t of dr.half_damage_from) {
      multipliers.set(t.name, (multipliers.get(t.name) ?? 1) * 0.5);
    }
    for (const t of dr.no_damage_from) {
      multipliers.set(t.name, 0);
    }
  }

  const results: MatchupResult[] = [];
  multipliers.forEach((mult, type) => {
    if (mult === 1) return;
    results.push({ type, multiplier: mult as Multiplier });
  });
  return results;
}

export function groupMatchups(results: MatchupResult[]): GroupedMatchups {
  const out: GroupedMatchups = {
    weak4x: [],
    weak2x: [],
    resist05x: [],
    resist025x: [],
    immune: [],
  };
  for (const r of results) {
    if (r.multiplier === 0) out.immune.push(r.type);
    else if (r.multiplier === 0.25) out.resist025x.push(r.type);
    else if (r.multiplier === 0.5) out.resist05x.push(r.type);
    else if (r.multiplier === 2) out.weak2x.push(r.type);
    else if (r.multiplier === 4) out.weak4x.push(r.type);
  }
  return out;
}
