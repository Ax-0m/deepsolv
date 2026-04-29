"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  useAllPokemon,
  useAllTypes,
  usePokemonByTypes,
  usePokemonCardsForPage,
  usePokemonPage,
  usePrefetchAllPokemon,
} from "@/lib/queries";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { PokemonCardData, PokemonSummary } from "@/lib/types";
import SearchBar from "./SearchBar";
import TypeFilter from "./TypeFilter";
import LetterFilter from "./LetterFilter";
import SortDropdown, { type SortKey } from "./SortDropdown";
import Pagination from "./Pagination";
import PokemonGrid, { CardSkeletonGrid } from "./PokemonGrid";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

const PAGE_SIZE = 20;
const VALID_SORTS: SortKey[] = [
  "dex",
  "name-asc",
  "name-desc",
  "stats-desc",
  "stats-asc",
  "height-desc",
  "weight-desc",
];

export default function HomeView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialTypes = useMemo(
    () =>
      (searchParams.get("type") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [searchParams],
  );
  const initialPage = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const rawLetter = (searchParams.get("letter") ?? "").toUpperCase();
  const initialLetter = /^[A-Z]$/.test(rawLetter) ? rawLetter : null;
  const rawSort = (searchParams.get("sort") ?? "dex") as SortKey;
  const initialSort: SortKey = VALID_SORTS.includes(rawSort) ? rawSort : "dex";

  const [searchInput, setSearchInput] = useState(initialQ);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes);
  const [letter, setLetter] = useState<string | null>(initialLetter);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [page, setPage] = useState(initialPage);
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  const isSearching = debouncedSearch.trim().length > 0;
  const hasTypeFilter = selectedTypes.length > 0;
  const hasLetter = !!letter;
  const isNameSort = sortKey === "name-asc" || sortKey === "name-desc";

  const needsMasterList =
    isSearching || hasLetter || (isNameSort && !hasTypeFilter);
  const useDefaultPagination =
    !isSearching && !hasTypeFilter && !hasLetter && !isNameSort;

  usePrefetchAllPokemon();

  const typesQuery = useAllTypes();
  const pageQuery = usePokemonPage(page, PAGE_SIZE);
  const masterListQuery = useAllPokemon(needsMasterList);
  const filteredByType = usePokemonByTypes(hasTypeFilter ? selectedTypes : []);

  const syncUrl = useCallback(
    (
      q: string,
      types: string[],
      pageNum: number,
      letterValue: string | null,
      sortValue: SortKey,
    ) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (types.length) params.set("type", types.join(","));
      if (letterValue) params.set("letter", letterValue);
      if (sortValue !== "dex") params.set("sort", sortValue);
      if (pageNum > 1) params.set("page", String(pageNum));
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    syncUrl(debouncedSearch, selectedTypes, page, letter, sortKey);
  }, [debouncedSearch, selectedTypes, page, letter, sortKey, syncUrl]);

  const filtered: PokemonSummary[] | null = useMemo(() => {
    if (useDefaultPagination) return null;
    let base: PokemonSummary[] = [];
    if (hasTypeFilter) {
      if (!filteredByType.data) return null;
      base = filteredByType.data;
    } else if (masterListQuery.data) {
      base = masterListQuery.data;
    } else {
      return null;
    }

    if (hasLetter) {
      const lower = letter!.toLowerCase();
      base = base.filter((p) => p.name.startsWith(lower));
    }

    if (isSearching) {
      const term = debouncedSearch.trim().toLowerCase();
      base = base.filter((p) => p.name.includes(term));
    }

    if (isNameSort) {
      const cmp = (a: PokemonSummary, b: PokemonSummary) =>
        a.name.localeCompare(b.name);
      const sorted = [...base].sort(cmp);
      return sortKey === "name-desc" ? sorted.reverse() : sorted;
    }

    return base;
  }, [
    useDefaultPagination,
    hasTypeFilter,
    isSearching,
    hasLetter,
    letter,
    isNameSort,
    sortKey,
    debouncedSearch,
    filteredByType.data,
    masterListQuery.data,
  ]);

  const totalCount = useDefaultPagination
    ? (pageQuery.data?.total ?? 0)
    : (filtered?.length ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageSlice: PokemonSummary[] = useMemo(() => {
    if (useDefaultPagination) {
      return pageQuery.data?.items ?? [];
    }
    if (!filtered) return [];
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [useDefaultPagination, pageQuery.data, filtered, safePage]);

  const detailQuery = usePokemonCardsForPage(pageSlice.map((p) => p.name));

  const sortedCards: PokemonCardData[] = useMemo(() => {
    const data = detailQuery.data ?? [];
    if (data.length === 0) return data;
    const arr = [...data];
    switch (sortKey) {
      case "name-asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "stats-desc":
        arr.sort((a, b) => b.totalStats - a.totalStats);
        break;
      case "stats-asc":
        arr.sort((a, b) => a.totalStats - b.totalStats);
        break;
      case "height-desc":
        arr.sort((a, b) => b.height - a.height);
        break;
      case "weight-desc":
        arr.sort((a, b) => b.weight - a.weight);
        break;
      default:
        break;
    }
    return arr;
  }, [detailQuery.data, sortKey]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleSearch = (next: string) => {
    setSearchInput(next);
    setPage(1);
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    );
    setPage(1);
  };

  const handleClearTypes = () => {
    setSelectedTypes([]);
    setPage(1);
  };

  const handleLetter = (next: string | null) => {
    setLetter(next);
    setPage(1);
  };

  const handleSort = (next: SortKey) => {
    setSortKey(next);
    if (
      next === "name-asc" ||
      next === "name-desc" ||
      next === "dex"
    ) {
      setPage(1);
    }
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleClearAll = () => {
    setSearchInput("");
    setSelectedTypes([]);
    setLetter(null);
    setSortKey("dex");
    setPage(1);
  };

  const overallError =
    pageQuery.error ??
    typesQuery.error ??
    filteredByType.error ??
    masterListQuery.error;

  const isInitialLoading = useDefaultPagination
    ? pageQuery.isLoading && !pageQuery.data
    : (hasTypeFilter && filteredByType.isLoading) ||
      (needsMasterList && !hasTypeFilter && masterListQuery.isLoading);

  const filtersActive =
    isSearching || hasTypeFilter || hasLetter || sortKey !== "dex";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 rounded-md border-4 border-dex-black bg-surface p-4 shadow-pixel sm:p-5"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="pixel-text rounded-sm bg-dex-red px-1.5 py-0.5 text-[8px] text-white"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
            >
              ENTRY
            </span>
            <h1
              className="pixel-text text-base text-foreground sm:text-lg"
              style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.08)" }}
            >
              Pokédex
            </h1>
          </div>
          <p className="pixel-mono text-base leading-tight text-foreground/65">
            Browse, search, filter and catch your favourite Pokémon.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={searchInput} onChange={handleSearch} />
          </div>
          <div className="flex items-center gap-2">
            <SortDropdown value={sortKey} onChange={handleSort} />
            {filtersActive ? (
              <button
                type="button"
                onClick={handleClearAll}
                className="pixel-btn rounded-sm bg-dex-red px-2.5 py-2 text-[8px] text-white"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto pb-1 scrollbar-thin">
          {typesQuery.data ? (
            <TypeFilter
              types={typesQuery.data}
              selected={selectedTypes}
              onToggle={handleToggleType}
              onClear={handleClearTypes}
            />
          ) : (
            <div className="flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 w-16 animate-pulse rounded-sm bg-surface-muted"
                />
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto pb-1 scrollbar-thin">
          <LetterFilter selected={letter} onSelect={handleLetter} />
        </div>
      </motion.section>

      <section className="flex flex-col gap-5">
        {overallError ? (
          <ErrorState
            onRetry={() => {
              pageQuery.refetch();
              typesQuery.refetch();
              if (needsMasterList) masterListQuery.refetch();
            }}
            message={overallError.message}
          />
        ) : isInitialLoading ? (
          <CardSkeletonGrid count={PAGE_SIZE} />
        ) : pageSlice.length === 0 ? (
          <EmptyState
            title="No Pokémon match your filters"
            message="Try a different name or clear the filters."
            action={
              filtersActive ? (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="pixel-btn rounded-sm bg-dex-red px-3 py-2 text-[10px] text-white"
                >
                  Clear all filters
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-sm border-2 border-dex-black bg-dex-black px-3 py-1.5 text-white">
              <span className="pixel-text text-[8px]">
                Showing <strong className="text-yellow-300">{(safePage - 1) * PAGE_SIZE + 1}</strong>-
                <strong className="text-yellow-300">
                  {Math.min(safePage * PAGE_SIZE, totalCount)}
                </strong>{" "}
                of <strong className="text-yellow-300">{totalCount.toLocaleString()}</strong>
              </span>
              <span className="pixel-text text-[8px]">
                Page <strong className="text-yellow-300">{safePage}</strong> / {totalPages}
              </span>
            </div>

            {detailQuery.error ? (
              <ErrorState
                onRetry={() => detailQuery.refetch()}
                message={(detailQuery.error as Error).message}
              />
            ) : sortedCards.length > 0 ? (
              <div className="relative">
                <PokemonGrid pokemon={sortedCards} />
                {detailQuery.isFetching ? (
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
                    <span className="pixel-text mt-2 rounded-sm border-2 border-dex-black bg-yellow-300 px-2 py-1 text-[8px] text-dex-black shadow-pixel-sm">
                      Updating...
                    </span>
                  </div>
                ) : null}
              </div>
            ) : detailQuery.isLoading ? (
              <CardSkeletonGrid count={pageSlice.length || PAGE_SIZE} />
            ) : (
              <LoadingSpinner />
            )}

            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
