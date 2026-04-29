"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundState {
  muted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      muted: true,
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setMuted: (muted) => set({ muted }),
    }),
    { name: "pokedex-lite-sound" },
  ),
);
