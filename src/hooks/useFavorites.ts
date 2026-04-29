"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addServerFavorite,
  clearServerFavorites,
  getServerFavorites,
  removeServerFavorite,
  syncLocalFavorites,
  type FavoritesActionResult,
} from "@/server/favorites";
import { useFavoritesStore, useHasHydrated } from "@/store/favorites";

export interface FavoritesAPI {
  ids: number[];
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
  clear: () => void;
  isReady: boolean;
  source: "local" | "server";
  isSyncing: boolean;
  isPending: (id: number) => boolean;
}

const SERVER_KEY = (userId?: string | null) =>
  ["favorites", "server", userId ?? "anon"] as const;

interface ToggleVars {
  id: number;
  makeFavorite: boolean;
}

export function useFavorites(): FavoritesAPI {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const isAuthed = status === "authenticated" && !!userId;

  const localIds = useFavoritesStore((s) => s.ids);
  const localToggle = useFavoritesStore((s) => s.toggle);
  const localClear = useFavoritesStore((s) => s.clear);
  const localHydrated = useHasHydrated();

  const queryClient = useQueryClient();
  const queryKey = SERVER_KEY(userId);

  const serverQuery = useQuery({
    queryKey,
    queryFn: () => getServerFavorites(),
    enabled: isAuthed,
    staleTime: 1000 * 60 * 5,
  });

  const serverIds = useMemo(
    () => serverQuery.data?.ids ?? [],
    [serverQuery.data],
  );

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const markPending = useCallback((id: number, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleMut = useMutation({
    mutationFn: async ({ id, makeFavorite }: ToggleVars) => {
      return makeFavorite ? addServerFavorite(id) : removeServerFavorite(id);
    },
    onMutate: async ({ id, makeFavorite }: ToggleVars) => {
      markPending(id, true);
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<FavoritesActionResult>(queryKey);
      const currentIds = previous?.ids ?? [];
      const next = makeFavorite
        ? currentIds.includes(id)
          ? currentIds
          : [...currentIds, id]
        : currentIds.filter((x) => x !== id);
      queryClient.setQueryData<FavoritesActionResult>(queryKey, {
        ok: true,
        ids: next,
      });
      return { previous };
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
      markPending(vars.id, false);
    },
    onSuccess: (_data, vars) => {
      markPending(vars.id, false);
    },
  });

  const toggleServer = useCallback(
    (id: number) => {
      const cached =
        queryClient.getQueryData<FavoritesActionResult>(queryKey);
      const currentIds = cached?.ids ?? [];
      const isCurrentlyFav = currentIds.includes(id);
      toggleMut.mutate({ id, makeFavorite: !isCurrentlyFav });
    },
    [queryClient, queryKey, toggleMut],
  );

  const mergeAttempted = useRef<string | null>(null);
  useEffect(() => {
    if (!isAuthed || !userId || !localHydrated) return;
    if (mergeAttempted.current === userId) return;
    if (localIds.length === 0) {
      mergeAttempted.current = userId;
      return;
    }
    mergeAttempted.current = userId;
    syncLocalFavorites(localIds).then((res) => {
      if (res.ok) {
        localClear();
        queryClient.setQueryData(queryKey, res);
      }
    });
  }, [
    isAuthed,
    userId,
    localHydrated,
    localIds,
    localClear,
    queryClient,
    queryKey,
  ]);

  useEffect(() => {
    if (status === "unauthenticated") {
      mergeAttempted.current = null;
    }
  }, [status]);

  if (isAuthed) {
    return {
      ids: serverIds,
      isFavorite: (id: number) => serverIds.includes(id),
      toggle: toggleServer,
      clear: async () => {
        const res = await clearServerFavorites();
        if (res.ok) {
          queryClient.setQueryData(queryKey, res);
        }
      },
      isReady: !serverQuery.isLoading,
      source: "server",
      isSyncing: serverQuery.isFetching || pendingIds.size > 0,
      isPending: (id: number) => pendingIds.has(id),
    };
  }

  return {
    ids: localIds,
    isFavorite: (id: number) => localIds.includes(id),
    toggle: localToggle,
    clear: localClear,
    isReady: localHydrated,
    source: "local",
    isSyncing: false,
    isPending: () => false,
  };
}
