import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  formatPokemonName,
  getAllPokemonNames,
  getEvolutionChain,
  getPokemon,
  getPokemonSpecies,
  getTypeData,
} from "@/lib/pokeapi";
import { computeDefensiveMatchups, groupMatchups } from "@/lib/matchups";
import PokemonDetail from "@/components/PokemonDetail";

interface Params {
  name: string;
}

interface PageProps {
  params: Params;
}

export const revalidate = 86400;

async function loadPokemonOrNull(name: string) {
  try {
    return await getPokemon(name.toLowerCase());
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pokemon = await loadPokemonOrNull(params.name);
  if (!pokemon) {
    return { title: "Pokémon not found · Pokédex" };
  }
  const types = pokemon.types.map((t) => formatPokemonName(t.type.name)).join(", ");
  const sprite = pokemon.sprites?.other?.["official-artwork"]?.front_default ?? undefined;
  return {
    title: `${formatPokemonName(pokemon.name)} · Pokédex`,
    description: `${formatPokemonName(pokemon.name)} (${types}) — view stats, evolutions, type matchups, abilities and more.`,
    openGraph: {
      title: `${formatPokemonName(pokemon.name)} · Pokédex`,
      description: `Stats, evolutions and matchups for ${formatPokemonName(pokemon.name)}.`,
      images: sprite ? [{ url: sprite }] : undefined,
    },
  };
}

export default async function PokemonPage({ params }: PageProps) {
  const pokemon = await loadPokemonOrNull(params.name);
  if (!pokemon) notFound();

  const [species, allNames, typeDataList] = await Promise.all([
    getPokemonSpecies(pokemon.species?.name ?? pokemon.id).catch(() => null),
    getAllPokemonNames().catch(() => [] as { id: number; name: string }[]),
    Promise.all(
      pokemon.types.map((t) => getTypeData(t.type.name).catch(() => null)),
    ),
  ]);

  const matchups = (() => {
    const valid = typeDataList.filter((t): t is NonNullable<typeof t> => !!t);
    if (valid.length === 0) return null;
    return groupMatchups(computeDefensiveMatchups(valid));
  })();

  const evoChain = species?.evolution_chain?.url
    ? await getEvolutionChain(species.evolution_chain.url).catch(() => null)
    : null;

  let prevName: string | null = null;
  let nextName: string | null = null;
  if (allNames.length > 0) {
    const idx = allNames.findIndex((p) => p.id === pokemon.id);
    if (idx !== -1) {
      prevName = idx > 0 ? allNames[idx - 1].name : null;
      nextName = idx < allNames.length - 1 ? allNames[idx + 1].name : null;
    }
  }

  return (
    <PokemonDetail
      pokemon={pokemon}
      species={species}
      matchups={matchups}
      evolutionChain={evoChain?.chain ?? null}
      prevName={prevName}
      nextName={nextName}
    />
  );
}
