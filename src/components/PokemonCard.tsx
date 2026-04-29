"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { spriteUrl, fallbackSprite, formatPokemonName } from "@/lib/pokeapi";
import { paddedId } from "@/lib/format";
import { typeStyle } from "@/lib/typeColors";
import type { PokemonCardData } from "@/lib/types";
import TypePill from "./TypePill";
import FavoriteButton from "./FavoriteButton";
import { useEffect, useState } from "react";
import { useSounds } from "@/hooks/useSounds";

interface Props {
  pokemon: PokemonCardData;
  priority?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

const LEGENDARY_THRESHOLD = 580;

export default function PokemonCard({ pokemon, priority = false }: Props) {
  const primary = pokemon.types[0] ?? "normal";
  const style = typeStyle(primary);
  const [imgSrc, setImgSrc] = useState(spriteUrl(pokemon.id));
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { play } = useSounds();

  const isPowerful = pokemon.totalStats >= LEGENDARY_THRESHOLD;

  useEffect(() => {
    setImgSrc(spriteUrl(pokemon.id));
    setLoaded(false);
    setFailed(false);
  }, [pokemon.id]);

  return (
    <motion.div
      layout
      variants={cardVariants}
      exit="exit"
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-md border-2 border-dex-black bg-surface shadow-pixel transition-shadow"
    >
      <Link
        href={`/pokemon/${pokemon.name}`}
        onClick={() => play("click")}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div
          className={`scanlines-overlay relative aspect-square overflow-hidden border-b-2 border-dex-black bg-gradient-to-br ${style.gradient}`}
        >
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

          <span className="pixel-text absolute left-2 top-2 z-[2] rounded-sm bg-black/60 px-1.5 py-0.5 text-[8px] text-white/95">
            {paddedId(pokemon.id)}
          </span>

          {isPowerful ? (
            <span
              className="pixel-text absolute right-2 bottom-2 z-[2] rounded-sm bg-yellow-300/95 px-1.5 py-0.5 text-[7px] text-amber-900"
              style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}
              title={`Total stats ${pokemon.totalStats}`}
            >
              ★ {pokemon.totalStats}
            </span>
          ) : null}

          {isPowerful ? (
            <div className="holo-shimmer-strong holo-shimmer pointer-events-none absolute inset-0 z-[1]" />
          ) : (
            <div className="holo-shimmer pointer-events-none absolute inset-0 z-[1]" />
          )}

          {!loaded && !failed ? (
            <div className="absolute inset-0 z-[1] grid place-items-center">
              <div className="h-12 w-12 animate-pulse rounded-full bg-white/30" />
            </div>
          ) : null}

          {failed ? (
            <div className="pixel-text absolute inset-0 z-[1] grid place-items-center text-3xl text-white/70">
              ?
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={pokemon.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className={`relative z-[1] object-contain p-4 transition-all duration-300 group-hover:scale-110 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              style={{
                filter:
                  "drop-shadow(2px 2px 0 rgba(0,0,0,0.35)) drop-shadow(0 0 12px rgba(255,255,255,0.15))",
                imageRendering: "auto",
              }}
              onLoad={() => setLoaded(true)}
              onError={() => {
                if (imgSrc !== fallbackSprite(pokemon.id)) {
                  setImgSrc(fallbackSprite(pokemon.id));
                  setLoaded(false);
                } else {
                  setFailed(true);
                }
              }}
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              unoptimized
            />
          )}
        </div>

        <div className="space-y-2 px-3 py-3">
          <h3
            className="pixel-text truncate text-[10px] text-foreground"
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.08)" }}
          >
            {formatPokemonName(pokemon.name)}
          </h3>
          <div className="flex flex-wrap gap-1">
            {pokemon.types.map((t) => (
              <TypePill key={t} name={t} />
            ))}
          </div>
        </div>
      </Link>
      <FavoriteButton
        id={pokemon.id}
        name={pokemon.name}
        className="absolute right-2 top-2 z-10"
      />
    </motion.div>
  );
}
