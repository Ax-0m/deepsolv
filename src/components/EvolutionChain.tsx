"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  fallbackSprite,
  formatPokemonName,
  spriteUrl,
} from "@/lib/pokeapi";
import { describeTrigger, flattenChain } from "@/lib/evolution";
import type { ChainLink } from "@/lib/types";

interface Props {
  chain: ChainLink;
  currentName: string;
}

export default function EvolutionChain({ chain, currentName }: Props) {
  const stages = flattenChain(chain);
  if (stages.length <= 1) {
    return (
      <p className="pixel-mono text-base text-foreground/60">
        This Pokémon does not evolve.
      </p>
    );
  }

  const root = stages.find((s) => s.parentName === null);
  if (!root) return null;

  const stageMap = new Map<string, typeof stages>();
  for (const s of stages) {
    if (s.parentName === null) continue;
    const arr = stageMap.get(s.parentName) ?? [];
    arr.push(s);
    stageMap.set(s.parentName, arr);
  }

  return (
    <div className="flex flex-wrap items-stretch gap-3 overflow-x-auto pb-1 scrollbar-thin sm:flex-nowrap">
      <Stage
        id={root.id}
        name={root.name}
        isCurrent={root.name === currentName}
      />
      <ColumnFor
        parent={root.name}
        stageMap={stageMap}
        currentName={currentName}
      />
    </div>
  );
}

function ColumnFor({
  parent,
  stageMap,
  currentName,
}: {
  parent: string;
  stageMap: Map<string, ReturnType<typeof flattenChain>>;
  currentName: string;
}) {
  const children = stageMap.get(parent) ?? [];
  if (children.length === 0) return null;

  return (
    <>
      <div className="flex flex-col items-stretch justify-center gap-3">
        {children.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3"
          >
            <Trigger label={c.trigger ? describeTrigger(c.trigger) : "—"} />
            <Stage
              id={c.id}
              name={c.name}
              isCurrent={c.name === currentName}
            />
          </div>
        ))}
      </div>
      {children.length === 1 ? (
        <ColumnFor
          parent={children[0].name}
          stageMap={stageMap}
          currentName={currentName}
        />
      ) : null}
    </>
  );
}

function Stage({
  id,
  name,
  isCurrent,
}: {
  id: number;
  name: string;
  isCurrent: boolean;
}) {
  const [src, setSrc] = useState(spriteUrl(id));

  return (
    <Link
      href={`/pokemon/${name}`}
      className={`flex shrink-0 flex-col items-center gap-1.5 rounded-sm border-2 border-dex-black p-2 shadow-pixel-sm transition ${
        isCurrent
          ? "bg-yellow-200"
          : "bg-surface hover:bg-surface-muted"
      }`}
      prefetch={false}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative h-20 w-20 sm:h-24 sm:w-24"
      >
        <Image
          src={src}
          alt={name}
          fill
          sizes="96px"
          className="object-contain"
          style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.25))" }}
          onError={() => setSrc(fallbackSprite(id))}
          unoptimized
        />
      </motion.div>
      <span className="pixel-text text-[8px] capitalize">
        {formatPokemonName(name)}
      </span>
    </Link>
  );
}

function Trigger({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1 text-foreground/60">
      <span className="pixel-text text-base leading-none" aria-hidden>
        ►
      </span>
      <span className="pixel-text max-w-[7rem] text-center text-[7px]">
        {label}
      </span>
    </div>
  );
}
