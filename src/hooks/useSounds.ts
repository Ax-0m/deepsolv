"use client";

import { useCallback } from "react";
import { useSoundStore } from "@/store/sound";
import { Sounds, type SoundName } from "@/lib/sounds";

export function useSounds() {
  const muted = useSoundStore((s) => s.muted);
  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;
      const fn = Sounds[name];
      if (typeof fn === "function") fn();
    },
    [muted],
  );
  return { play, muted };
}
