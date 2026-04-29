import type {
  EvolutionChain,
  PokemonCardData,
  PokemonDetail,
  PokemonListResponse,
  PokemonSpecies,
  PokemonSummary,
  TypeData,
  TypeDetail,
  TypeListResponse,
} from "./types";

export const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const ALWAYS_REVALIDATE_DAY = 60 * 60 * 24;

interface FetchOptions {
  revalidate?: number;
  signal?: AbortSignal;
}

async function pokeFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${POKEAPI_BASE}${path}`;
  const init: RequestInit & { next?: { revalidate: number } } = {
    signal: opts.signal,
  };
  if (typeof window === "undefined") {
    init.next = { revalidate: opts.revalidate ?? ALWAYS_REVALIDATE_DAY };
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`PokeAPI ${res.status} ${res.statusText} on ${path}`);
  }
  return res.json() as Promise<T>;
}

export function idFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  if (match) return Number(match[1]);
  const fallback = url.replace(/\/$/, "").split("/").pop();
  return fallback ? Number(fallback) : 0;
}

export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function fallbackSprite(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export async function getAllPokemonNames(opts: FetchOptions = {}): Promise<PokemonSummary[]> {
  const data = await pokeFetch<PokemonListResponse>(
    "/pokemon?limit=100000&offset=0",
    opts,
  );
  return data.results
    .map((entry) => ({ id: idFromUrl(entry.url), name: entry.name }))
    .filter((entry) => entry.id > 0);
}

export interface PokemonPage {
  total: number;
  items: PokemonSummary[];
}

export async function getPokemonPage(
  offset: number,
  limit: number,
  opts: FetchOptions = {},
): Promise<PokemonPage> {
  const data = await pokeFetch<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
    opts,
  );
  return {
    total: data.count,
    items: data.results
      .map((entry) => ({ id: idFromUrl(entry.url), name: entry.name }))
      .filter((entry) => entry.id > 0),
  };
}

export async function getAllTypes(opts: FetchOptions = {}): Promise<string[]> {
  const data = await pokeFetch<TypeListResponse>("/type", opts);
  return data.results
    .map((entry) => entry.name)
    .filter((name) => name !== "unknown" && name !== "shadow" && name !== "stellar");
}

export async function getPokemon(idOrName: string | number, opts: FetchOptions = {}): Promise<PokemonDetail> {
  return pokeFetch<PokemonDetail>(`/pokemon/${idOrName}`, opts);
}

export async function getPokemonSpecies(idOrName: string | number, opts: FetchOptions = {}): Promise<PokemonSpecies> {
  return pokeFetch<PokemonSpecies>(`/pokemon-species/${idOrName}`, opts);
}

export function pickEnglishFlavorText(species: PokemonSpecies): string | null {
  const entry = species.flavor_text_entries.find((e) => e.language.name === "en");
  if (!entry) return null;
  return entry.flavor_text.replace(/[\f\n\r]+/g, " ").replace(/\s+/g, " ").trim();
}

export function pickEnglishGenus(species: PokemonSpecies): string | null {
  return species.genera.find((g) => g.language.name === "en")?.genus ?? null;
}

export async function getEvolutionChain(
  url: string,
  opts: FetchOptions = {},
): Promise<EvolutionChain> {
  return pokeFetch<EvolutionChain>(url, opts);
}

export async function getTypeData(
  name: string,
  opts: FetchOptions = {},
): Promise<TypeData> {
  return pokeFetch<TypeData>(`/type/${name}`, opts);
}

export async function getPokemonByType(typeName: string, opts: FetchOptions = {}): Promise<PokemonSummary[]> {
  const data = await pokeFetch<TypeDetail>(`/type/${typeName}`, opts);
  return data.pokemon
    .map((entry) => ({ id: idFromUrl(entry.pokemon.url), name: entry.pokemon.name }))
    .filter((entry) => entry.id > 0);
}

export async function getManyPokemon(
  names: string[],
  opts: FetchOptions = {},
): Promise<PokemonDetail[]> {
  const results = await Promise.allSettled(
    names.map((name) => getPokemon(name, opts)),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<PokemonDetail> => r.status === "fulfilled")
    .map((r) => r.value);
}

export function toCardData(detail: PokemonDetail): PokemonCardData {
  return {
    id: detail.id,
    name: detail.name,
    types: detail.types
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name),
    totalStats: detail.stats.reduce((sum, s) => sum + s.base_stat, 0),
    height: detail.height,
    weight: detail.weight,
  };
}

export async function getManyPokemonCards(
  namesOrIds: Array<string | number>,
  opts: FetchOptions = {},
): Promise<PokemonCardData[]> {
  const results = await Promise.allSettled(
    namesOrIds.map((id) => getPokemon(id, opts)),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<PokemonDetail> => r.status === "fulfilled")
    .map((r) => toCardData(r.value));
}

export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatStatName(name: string): string {
  switch (name) {
    case "hp":
      return "HP";
    case "attack":
      return "Attack";
    case "defense":
      return "Defense";
    case "special-attack":
      return "Sp. Atk";
    case "special-defense":
      return "Sp. Def";
    case "speed":
      return "Speed";
    default:
      return formatPokemonName(name);
  }
}
