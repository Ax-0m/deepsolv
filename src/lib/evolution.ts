import { idFromUrl } from "./pokeapi";
import type { ChainLink, EvolutionDetail } from "./types";

export interface EvolutionStage {
  id: number;
  name: string;
  parentName: string | null;
  trigger: EvolutionDetail | null;
}

export function flattenChain(chain: ChainLink): EvolutionStage[] {
  const out: EvolutionStage[] = [];
  function walk(node: ChainLink, parentName: string | null) {
    const url = node.species.url;
    const id = idFromSpeciesUrl(url);
    out.push({
      id,
      name: node.species.name,
      parentName,
      trigger: node.evolution_details[0] ?? null,
    });
    for (const child of node.evolves_to) {
      walk(child, node.species.name);
    }
  }
  walk(chain, null);
  return out;
}

function idFromSpeciesUrl(url: string): number {
  const m = url.match(/\/pokemon-species\/(\d+)\/?$/);
  if (m) return Number(m[1]);
  return idFromUrl(url);
}

export function describeTrigger(d: EvolutionDetail): string {
  const parts: string[] = [];
  const trigger = d.trigger?.name;

  if (d.min_level) parts.push(`Lvl ${d.min_level}`);
  if (d.item) parts.push(formatRef(d.item.name));
  if (d.held_item) parts.push(`hold ${formatRef(d.held_item.name)}`);
  if (d.known_move) parts.push(`know ${formatRef(d.known_move.name)}`);
  if (d.known_move_type) parts.push(`${formatRef(d.known_move_type.name)} move`);
  if (d.location) parts.push(`at ${formatRef(d.location.name)}`);
  if (d.min_happiness != null) parts.push(`happy ${d.min_happiness}+`);
  if (d.min_affection != null) parts.push(`affection ${d.min_affection}+`);
  if (d.min_beauty != null) parts.push(`beauty ${d.min_beauty}+`);
  if (d.time_of_day) parts.push(d.time_of_day);
  if (d.gender === 1) parts.push("female");
  if (d.gender === 2) parts.push("male");
  if (d.needs_overworld_rain) parts.push("rain");
  if (d.party_species) parts.push(`w/ ${formatRef(d.party_species.name)}`);
  if (d.party_type) parts.push(`w/ ${formatRef(d.party_type.name)} type`);
  if (d.trade_species) parts.push(`trade for ${formatRef(d.trade_species.name)}`);
  if (d.turn_upside_down) parts.push("upside down");
  if (d.relative_physical_stats === 1) parts.push("Atk > Def");
  if (d.relative_physical_stats === -1) parts.push("Atk < Def");
  if (d.relative_physical_stats === 0) parts.push("Atk = Def");

  if (parts.length === 0 && trigger) {
    return formatRef(trigger);
  }
  return parts.join(" · ");
}

function formatRef(name: string): string {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
