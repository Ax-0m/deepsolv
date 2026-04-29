"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FavoritesState {
  ids: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => {
          const exists = state.ids.includes(id);
          return {
            ids: exists ? state.ids.filter((x) => x !== id) : [...state.ids, id],
          };
        }),
      isFavorite: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "pokedex:favorites",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useFavoritesStore.persist.onFinishHydration(() => setHydrated(true));
    if (useFavoritesStore.persist.hasHydrated()) setHydrated(true);
    return () => {
      unsub();
    };
  }, []);
  return hydrated;
}
