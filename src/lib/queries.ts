"use client";

import { useEffect, useMemo } from "react";
import {
  keepPreviousData,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAllPokemonNames,
  getAllTypes,
  getManyPokemonCards,
  getPokemonByType,
  getPokemonPage,
  type PokemonPage,
} from "./pokeapi";
import type { PokemonCardData, PokemonSummary } from "./types";

const ALL_NAMES_KEY = ["pokemon", "all-names"] as const;
const TYPES_KEY = ["pokemon", "types"] as const;

export function useAllPokemon(enabled = true) {
  return useQuery<PokemonSummary[]>({
    queryKey: ALL_NAMES_KEY,
    queryFn: ({ signal }) => getAllPokemonNames({ signal }),
    enabled,
    staleTime: 1000 * 60 * 60 * 6,
  });
}

export function usePrefetchAllPokemon() {
  const qc = useQueryClient();
  useEffect(() => {
    const idle = (cb: () => void) => {
      const win = window as Window &
        typeof globalThis & {
          requestIdleCallback?: (cb: () => void) => number;
        };
      if (typeof win.requestIdleCallback === "function") {
        win.requestIdleCallback(cb);
      } else {
        setTimeout(cb, 200);
      }
    };
    idle(() => {
      qc.prefetchQuery({
        queryKey: ALL_NAMES_KEY,
        queryFn: ({ signal }) => getAllPokemonNames({ signal }),
        staleTime: 1000 * 60 * 60 * 6,
      });
    });
  }, [qc]);
}

export function useAllTypes() {
  return useQuery<string[]>({
    queryKey: TYPES_KEY,
    queryFn: ({ signal }) => getAllTypes({ signal }),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function usePokemonPage(page: number, pageSize: number) {
  return useQuery<PokemonPage>({
    queryKey: ["pokemon", "page", page, pageSize],
    queryFn: ({ signal }) =>
      getPokemonPage((page - 1) * pageSize, pageSize, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60,
  });
}

export interface PokemonByTypesResult {
  data: PokemonSummary[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function usePokemonByTypes(types: string[]): PokemonByTypesResult {
  const results = useQueries({
    queries: types.map((type) => ({
      queryKey: ["pokemon", "by-type", type],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        getPokemonByType(type, { signal }),
      staleTime: 1000 * 60 * 60 * 24,
    })),
  });

  return useMemo(() => {
    if (types.length === 0) {
      return { data: null, isLoading: false, error: null };
    }
    const isLoading = results.some((r) => r.isLoading);
    const error = results.find((r) => r.error)?.error as Error | undefined;
    if (isLoading || error || results.some((r) => !r.data)) {
      return { data: null, isLoading, error: error ?? null };
    }
    const lists = results.map((r) => r.data ?? []);
    const [first, ...rest] = lists;
    if (!first) return { data: [], isLoading: false, error: null };
    const intersection = first.filter((p) =>
      rest.every((other) => other.some((o) => o.id === p.id)),
    );
    return { data: intersection, isLoading: false, error: null };
  }, [results, types]);
}

export function usePokemonCardsForPage(names: string[]) {
  return useQuery<PokemonCardData[]>({
    queryKey: ["pokemon", "cards-batch", names],
    queryFn: ({ signal }) => getManyPokemonCards(names, { signal }),
    enabled: names.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60,
  });
}
