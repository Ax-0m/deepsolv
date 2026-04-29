"use client";

import Image from "next/image";
import { spriteUrl } from "@/lib/pokeapi";
import { useSounds } from "@/hooks/useSounds";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't reach the Pokédex. Please try again.",
  onRetry,
}: Props) {
  const { play } = useSounds();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="relative h-32 w-32 animate-shake">
        <Image
          src={spriteUrl(54)}
          alt=""
          fill
          sizes="128px"
          className="object-contain"
          style={{ filter: "drop-shadow(2px 4px 0 rgba(0,0,0,0.25))" }}
          unoptimized
        />
      </div>
      <h2 className="pixel-text text-sm text-dex-red">{title}</h2>
      <p className="pixel-mono max-w-sm text-base leading-tight text-foreground/70">
        {message}
      </p>
      {onRetry ? (
        <button
          onClick={() => {
            play("click");
            onRetry();
          }}
          className="pixel-btn mt-2 rounded-sm bg-accent px-4 py-2 text-[10px] text-white"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
