"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  fallbackSprite,
  formatPokemonName,
  pickEnglishFlavorText,
  pickEnglishGenus,
  spriteUrl,
} from "@/lib/pokeapi";
import { dexHeight, dexWeight, paddedId } from "@/lib/format";
import { typeStyle } from "@/lib/typeColors";
import type {
  ChainLink,
  PokemonDetail as Detail,
  PokemonSpecies,
} from "@/lib/types";
import type { GroupedMatchups } from "@/lib/matchups";
import TypePill from "./TypePill";
import StatBar from "./StatBar";
import FavoriteButton from "./FavoriteButton";
import DamageRelations from "./DamageRelations";
import EvolutionChain from "./EvolutionChain";
import { useSounds } from "@/hooks/useSounds";

interface Props {
  pokemon: Detail;
  species?: PokemonSpecies | null;
  matchups?: GroupedMatchups | null;
  evolutionChain?: ChainLink | null;
  prevName?: string | null;
  nextName?: string | null;
}

type SpriteKey = "default" | "back" | "shiny" | "shinyBack";

interface SpriteOption {
  key: SpriteKey;
  label: string;
  url: string;
}

const MOVES_INITIAL = 18;

export default function PokemonDetail({
  pokemon,
  species,
  matchups,
  evolutionChain,
  prevName,
  nextName,
}: Props) {
  const primary = pokemon.types[0]?.type.name ?? "normal";
  const style = typeStyle(primary);
  const { play } = useSounds();

  const spriteOptions: SpriteOption[] = useMemo(() => {
    const opts: SpriteOption[] = [
      { key: "default", label: "Default", url: spriteUrl(pokemon.id) },
    ];
    if (pokemon.sprites?.back_default)
      opts.push({ key: "back", label: "Back", url: pokemon.sprites.back_default });
    const shinyArt = pokemon.sprites?.other?.["official-artwork"]?.front_shiny;
    if (shinyArt) opts.push({ key: "shiny", label: "Shiny", url: shinyArt });
    else if (pokemon.sprites?.front_shiny)
      opts.push({ key: "shiny", label: "Shiny", url: pokemon.sprites.front_shiny });
    if (pokemon.sprites?.back_shiny)
      opts.push({ key: "shinyBack", label: "Shiny Back", url: pokemon.sprites.back_shiny });
    return opts;
  }, [pokemon]);

  const [activeSprite, setActiveSprite] = useState<SpriteKey>("default");
  const [imgErrored, setImgErrored] = useState(false);
  const [movesExpanded, setMovesExpanded] = useState(false);

  const currentSprite =
    spriteOptions.find((s) => s.key === activeSprite) ?? spriteOptions[0];

  const moveNames = useMemo(
    () => pokemon.moves.map((m) => m.move.name).sort((a, b) => a.localeCompare(b)),
    [pokemon.moves],
  );
  const visibleMoves = movesExpanded
    ? moveNames
    : moveNames.slice(0, MOVES_INITIAL);

  const flavor = species ? pickEnglishFlavorText(species) : null;
  const genus = species ? pickEnglishGenus(species) : null;

  const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          onClick={() => play("click")}
          className="pixel-btn inline-flex items-center gap-1 rounded-sm bg-surface px-3 py-2 text-[10px] text-foreground"
        >
          ◄ BACK
        </Link>
        <div className="flex items-center gap-2">
          {prevName ? (
            <Link
              href={`/pokemon/${prevName}`}
              onClick={() => play("click")}
              className="pixel-btn rounded-sm bg-surface px-2.5 py-2 text-[8px] capitalize text-foreground"
              prefetch={false}
            >
              ‹ {formatPokemonName(prevName)}
            </Link>
          ) : null}
          {nextName ? (
            <Link
              href={`/pokemon/${nextName}`}
              onClick={() => play("click")}
              className="pixel-btn rounded-sm bg-surface px-2.5 py-2 text-[8px] capitalize text-foreground"
              prefetch={false}
            >
              {formatPokemonName(nextName)} ›
            </Link>
          ) : null}
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-md border-4 border-dex-black bg-surface shadow-pixel"
      >
        <div
          className={`relative grid grid-cols-1 gap-6 border-b-4 border-dex-black bg-gradient-to-br ${style.gradient} p-6 text-white sm:grid-cols-[300px_1fr] sm:p-8`}
        >
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-15" />

          <div className="relative flex flex-col items-center gap-3">
            <div className="scanlines-overlay relative aspect-square w-56 overflow-hidden rounded-md border-4 border-dex-black bg-dex-screen-mid sm:w-full">
              <span
                className="pixel-text pointer-events-none absolute right-2 top-2 z-10 rounded-sm bg-black/60 px-1.5 py-0.5 text-[7px] text-white/95"
                aria-hidden
              >
                CH-1
              </span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSprite.key + (imgErrored ? "-fb" : "")}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 grid place-items-center"
                >
                  <Image
                    src={imgErrored ? fallbackSprite(pokemon.id) : currentSprite.url}
                    alt={`${pokemon.name} ${currentSprite.label}`}
                    fill
                    priority
                    sizes="(max-width: 640px) 60vw, 280px"
                    className="object-contain p-6"
                    style={{
                      filter:
                        "drop-shadow(2px 4px 0 rgba(0,0,0,0.4)) drop-shadow(0 0 16px rgba(255,255,255,0.2))",
                    }}
                    onError={() => setImgErrored(true)}
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute bottom-1 left-1.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="pixel-text text-[7px] text-white/80">REC</span>
              </div>
            </div>
            {spriteOptions.length > 1 ? (
              <div className="flex flex-wrap justify-center gap-1.5">
                {spriteOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      play("click");
                      setActiveSprite(opt.key);
                      setImgErrored(false);
                    }}
                    className={`pixel-text rounded-sm px-2 py-1 text-[8px] transition ${
                      currentSprite.key === opt.key
                        ? "bg-white text-stone-900 shadow-pixel-sm"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative flex flex-col justify-center gap-3">
            <span
              className="pixel-text inline-block w-fit rounded-sm bg-black/40 px-2 py-1 text-[10px] text-white"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
            >
              {paddedId(pokemon.id)}
            </span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1
                  className="pixel-text text-2xl leading-tight text-white sm:text-3xl"
                  style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.45)" }}
                >
                  {formatPokemonName(pokemon.name)}
                </h1>
                {genus ? (
                  <p className="pixel-mono mt-1 text-base leading-tight text-white/90">
                    {genus}
                  </p>
                ) : null}
              </div>
              <FavoriteButton id={pokemon.id} name={pokemon.name} size="lg" />
            </div>
            <div className="flex flex-wrap gap-2">
              {pokemon.types.map((t) => (
                <TypePill key={t.type.name} name={t.type.name} size="md" />
              ))}
              {species?.is_legendary ? (
                <span
                  className="pixel-text rounded-sm bg-amber-300 px-2 py-1 text-[8px] text-amber-900 shadow-pixel-inset"
                  style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}
                >
                  ★ Legendary
                </span>
              ) : null}
              {species?.is_mythical ? (
                <span
                  className="pixel-text rounded-sm bg-fuchsia-300 px-2 py-1 text-[8px] text-fuchsia-900 shadow-pixel-inset"
                  style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}
                >
                  ☄ Mythical
                </span>
              ) : null}
            </div>
            <dl className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <dt className="pixel-text text-[7px] text-white/70">Height</dt>
                <dd className="pixel-mono text-base font-bold leading-tight text-white">
                  {dexHeight(pokemon.height)}
                </dd>
              </div>
              <div>
                <dt className="pixel-text text-[7px] text-white/70">Weight</dt>
                <dd className="pixel-mono text-base font-bold leading-tight text-white">
                  {dexWeight(pokemon.weight)}
                </dd>
              </div>
              <div>
                <dt className="pixel-text text-[7px] text-white/70">Base XP</dt>
                <dd className="pixel-mono text-base font-bold leading-tight text-white">
                  {pokemon.base_experience ?? "—"}
                </dd>
              </div>
              {species?.habitat?.name ? (
                <div>
                  <dt className="pixel-text text-[7px] text-white/70">Habitat</dt>
                  <dd className="pixel-mono text-base font-bold leading-tight capitalize text-white">
                    {species.habitat.name}
                  </dd>
                </div>
              ) : species?.generation?.name ? (
                <div>
                  <dt className="pixel-text text-[7px] text-white/70">Gen</dt>
                  <dd className="pixel-mono text-base font-bold leading-tight capitalize text-white">
                    {species.generation.name.replace("generation-", "Gen ")}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        {flavor ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border-b-2 border-dashed border-border bg-surface-muted/40 px-6 py-4 sm:px-8"
          >
            <p className="pixel-mono text-lg leading-snug text-foreground/85">
              <span className="pixel-text mr-1.5 text-[8px] text-foreground/50">
                DEX:
              </span>
              &ldquo;{flavor}&rdquo;
            </p>
          </motion.div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="pixel-text text-[10px] text-foreground/70">
              ▸ Base Stats
            </h2>
            <div className="flex flex-col gap-2">
              {pokemon.stats.map((stat) => (
                <StatBar
                  key={stat.stat.name}
                  name={stat.stat.name}
                  value={stat.base_stat}
                />
              ))}
              <div className="mt-2 flex items-center justify-between rounded-sm border-2 border-dex-black bg-dex-black px-3 py-2 text-white">
                <span className="pixel-text text-[9px]">Total</span>
                <span className="pixel-mono text-xl font-bold leading-none tabular-nums">
                  {total}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="pixel-text text-[10px] text-foreground/70">
              ▸ Abilities
            </h2>
            <ul className="flex flex-col gap-2">
              {pokemon.abilities.map((a) => (
                <li
                  key={a.ability.name}
                  className="flex items-center justify-between rounded-sm border-2 border-dex-black bg-surface px-3 py-2 shadow-pixel-sm"
                >
                  <span className="pixel-mono text-base font-bold leading-tight capitalize text-foreground">
                    {formatPokemonName(a.ability.name)}
                  </span>
                  {a.is_hidden ? (
                    <span className="pixel-text rounded-sm bg-foreground/15 px-1.5 py-0.5 text-[7px]">
                      Hidden
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            {species ? (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="rounded-sm border-2 border-dex-black bg-surface px-3 py-2 shadow-pixel-sm">
                  <div className="pixel-text text-[7px] text-foreground/55">
                    Catch Rate
                  </div>
                  <div className="pixel-mono text-base font-bold leading-tight">
                    {species.capture_rate} / 255
                  </div>
                </div>
                <div className="rounded-sm border-2 border-dex-black bg-surface px-3 py-2 shadow-pixel-sm">
                  <div className="pixel-text text-[7px] text-foreground/55">
                    Generation
                  </div>
                  <div className="pixel-mono text-base font-bold leading-tight capitalize">
                    {species.generation.name.replace("generation-", "Gen ")}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {evolutionChain ? (
          <div className="border-t-2 border-dashed border-border p-6 sm:p-8">
            <h2 className="pixel-text mb-3 text-[10px] text-foreground/70">
              ▸ Evolution Chain
            </h2>
            <EvolutionChain chain={evolutionChain} currentName={pokemon.name} />
          </div>
        ) : null}

        {matchups ? (
          <div className="border-t-2 border-dashed border-border p-6 sm:p-8">
            <h2 className="pixel-text mb-3 text-[10px] text-foreground/70">
              ▸ Damage Relations
            </h2>
            <DamageRelations matchups={matchups} />
          </div>
        ) : null}

        {moveNames.length > 0 ? (
          <div className="border-t-2 border-dashed border-border p-6 sm:p-8">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="pixel-text text-[10px] text-foreground/70">
                ▸ Moves{" "}
                <span className="ml-1 text-foreground/40">
                  ({moveNames.length})
                </span>
              </h2>
              {moveNames.length > MOVES_INITIAL ? (
                <button
                  type="button"
                  onClick={() => {
                    play("click");
                    setMovesExpanded((v) => !v);
                  }}
                  className="pixel-btn rounded-sm bg-surface px-2.5 py-1 text-[8px]"
                >
                  {movesExpanded ? "Show fewer" : `All ${moveNames.length}`}
                </button>
              ) : null}
            </div>
            <motion.div layout className="flex flex-wrap gap-1.5">
              {visibleMoves.map((name) => (
                <span
                  key={name}
                  className="pixel-text rounded-sm border-2 border-dex-black bg-surface px-2 py-1 text-[8px] capitalize text-foreground/85 shadow-pixel-sm"
                >
                  {formatPokemonName(name)}
                </span>
              ))}
            </motion.div>
          </div>
        ) : null}
      </motion.section>
    </div>
  );
}
