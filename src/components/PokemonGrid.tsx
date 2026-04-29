"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PokemonCardData } from "@/lib/types";
import PokemonCard from "./PokemonCard";

interface Props {
  pokemon: PokemonCardData[];
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03, delayChildren: 0.05 },
  },
};

export default function PokemonGrid({ pokemon }: Props) {
  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
    >
      <AnimatePresence mode="popLayout">
        {pokemon.map((p, idx) => (
          <PokemonCard key={p.id} pokemon={p} priority={idx < 5} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export function CardSkeletonGrid({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-md border-2 border-dex-black bg-surface shadow-pixel"
          aria-hidden
        >
          <div className="aspect-square animate-pulse border-b-2 border-dex-black bg-surface-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-2/3 animate-pulse rounded-sm bg-surface-muted" />
            <div className="flex gap-1">
              <div className="h-3.5 w-10 animate-pulse rounded-sm bg-surface-muted" />
              <div className="h-3.5 w-10 animate-pulse rounded-sm bg-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
