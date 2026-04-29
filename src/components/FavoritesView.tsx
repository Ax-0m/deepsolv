"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import { getManyPokemonCards } from "@/lib/pokeapi";
import PokemonGrid, { CardSkeletonGrid } from "./PokemonGrid";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function FavoritesView() {
  const { ids, isReady, clear, source, isSyncing } = useFavorites();
  const hydrated = isReady;

  const detailQuery = useQuery({
    queryKey: ["favorites", "cards", ids],
    queryFn: ({ signal }) => getManyPokemonCards(ids, { signal }),
    enabled: hydrated && ids.length > 0,
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your Favorites
          </h1>
          <p className="text-sm text-foreground/60">
            {hydrated
              ? ids.length === 0
                ? "Start adding Pokémon to your collection."
                : `${ids.length} Pokémon saved ${source === "server" ? "to your account" : "locally on this device"}${isSyncing ? " · syncing…" : ""}.`
              : "Loading…"}
          </p>
        </div>
        {hydrated && ids.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (confirm("Remove all favorites?")) clear();
            }}
            className="surface rounded-full px-4 py-1.5 text-sm font-medium transition hover:bg-surface-muted"
          >
            Clear all
          </button>
        ) : null}
      </motion.section>

      {!hydrated ? (
        <CardSkeletonGrid count={8} />
      ) : ids.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Tap the heart on any Pokémon to save it here."
          action={
            <Link
              href="/"
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
            >
              Browse Pokémon
            </Link>
          }
        />
      ) : detailQuery.isLoading ? (
        <CardSkeletonGrid count={Math.min(ids.length, 12)} />
      ) : detailQuery.error ? (
        <ErrorState
          onRetry={() => detailQuery.refetch()}
          message={(detailQuery.error as Error).message}
        />
      ) : detailQuery.data && detailQuery.data.length > 0 ? (
        <PokemonGrid pokemon={detailQuery.data} />
      ) : (
        <EmptyState title="Couldn't load your favorites" />
      )}
    </div>
  );
}
