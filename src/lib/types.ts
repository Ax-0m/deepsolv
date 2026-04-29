export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface PokemonTypeSlot {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
    dream_world?: {
      front_default: string | null;
    };
    home?: {
      front_default: string | null;
    };
  };
}

export interface PokemonMoveSlot {
  move: NamedAPIResource;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMoveSlot[];
  sprites: PokemonSprites;
  species: NamedAPIResource;
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
  version: NamedAPIResource;
}

export interface GenusEntry {
  genus: string;
  language: NamedAPIResource;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: FlavorTextEntry[];
  genera: GenusEntry[];
  is_legendary: boolean;
  is_mythical: boolean;
  capture_rate: number;
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  evolution_chain: { url: string };
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: NamedAPIResource;
  item: NamedAPIResource | null;
  held_item: NamedAPIResource | null;
  gender: number | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  needs_overworld_rain: boolean;
  time_of_day: string;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  party_species: NamedAPIResource | null;
  party_type: NamedAPIResource | null;
  trade_species: NamedAPIResource | null;
  turn_upside_down: boolean;
  relative_physical_stats: number | null;
}

export interface ChainLink {
  is_baby: boolean;
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}

export interface DamageRelations {
  double_damage_from: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  no_damage_to: NamedAPIResource[];
}

export interface TypeData {
  id: number;
  name: string;
  damage_relations: DamageRelations;
}

export interface TypeListResponse {
  count: number;
  results: NamedAPIResource[];
}

export interface TypePokemonEntry {
  slot: number;
  pokemon: NamedAPIResource;
}

export interface TypeDetail {
  id: number;
  name: string;
  pokemon: TypePokemonEntry[];
}

export interface PokemonSummary {
  id: number;
  name: string;
}

export interface PokemonCardData {
  id: number;
  name: string;
  types: string[];
  totalStats: number;
  height: number;
  weight: number;
}
