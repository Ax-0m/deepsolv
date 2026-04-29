"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import { useSounds } from "@/hooks/useSounds";
import { useToastStore } from "@/store/toasts";
import { formatPokemonName } from "@/lib/pokeapi";
import PokeBall from "./PokeBall";

interface Props {
  id: number;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { box: "h-9 w-9", ball: 26 },
  md: { box: "h-10 w-10", ball: 30 },
  lg: { box: "h-12 w-12", ball: 38 },
} as const;

export default function FavoriteButton({
  id,
  name,
  size = "sm",
  className = "",
}: Props) {
  const { isFavorite, toggle, isReady, isPending } = useFavorites();
  const active = isReady && isFavorite(id);
  const pending = isPending(id);
  const cfg = SIZE_MAP[size];
  const { play } = useSounds();
  const pushToast = useToastStore((s) => s.push);

  const [catching, setCatching] = useState(false);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    const willActivate = !active;
    const displayName = name
      ? formatPokemonName(name)
      : `Pokémon #${String(id).padStart(4, "0")}`;
    if (willActivate) {
      setCatching(true);
      play("catch");
      window.setTimeout(() => setCatching(false), 600);
      pushToast({
        title: "GOTCHA!",
        message: `${displayName} was caught!`,
        variant: "catch",
        spriteId: id,
      });
    } else {
      play("release");
      pushToast({
        title: "RELEASED",
        message: `${displayName} was set free`,
        variant: "release",
        spriteId: id,
      });
    }
    toggle(id);
  };

  return (
    <motion.button
      type="button"
      disabled={pending}
      whileTap={pending ? undefined : { scale: 0.85 }}
      onClick={handle}
      aria-pressed={active}
      aria-busy={pending}
      aria-label={active ? "Release this Pokémon" : "Catch this Pokémon"}
      title={active ? "Release" : "Catch"}
      className={`${cfg.box} ${className} relative grid place-items-center rounded-sm border-2 border-dex-black bg-white shadow-pixel-sm transition hover:scale-110 disabled:cursor-wait disabled:opacity-80 disabled:hover:scale-100`}
    >
      <AnimatePresence>
        {catching ? (
          <motion.div
            key="flash"
            className="pointer-events-none absolute inset-0 rounded-sm bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, times: [0, 0.3, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <motion.span
        key={active ? "on" : "off"}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={
          catching
            ? {
                scale: 1,
                opacity: 1,
                rotate: [0, -12, 12, -8, 8, 0],
              }
            : { scale: 1, opacity: 1, rotate: 0 }
        }
        transition={
          catching
            ? { duration: 0.55, ease: "easeInOut" }
            : { type: "spring", stiffness: 500, damping: 18 }
        }
        className="relative grid place-items-center"
        aria-hidden
      >
        <PokeBall size={cfg.ball} caught={active} />
      </motion.span>

      {pending && !catching ? (
        <span
          className="pixel-text pointer-events-none absolute -bottom-1 -right-1 animate-blink rounded-sm bg-dex-red px-1 text-[7px] text-white shadow-pixel-sm"
          aria-hidden
        >
          ...
        </span>
      ) : null}
    </motion.button>
  );
}
