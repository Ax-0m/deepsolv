"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getManyPokemonCards, spriteUrl, fallbackSprite, formatPokemonName } from "@/lib/pokeapi";
import { paddedId } from "@/lib/format";
import { useState } from "react";

interface ProfileData {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: Date | string | null;
  };
  favoriteCount: number;
  recentFavorites: number[];
  providers: string[];
}

interface Props {
  profile: ProfileData | null;
  sessionUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  persistenceEnabled: boolean;
}

export default function ProfileView({ profile, sessionUser, persistenceEnabled }: Props) {
  const user = profile?.user ?? { ...sessionUser, createdAt: null };
  const recent = profile?.recentFavorites ?? [];

  const recentQuery = useQuery({
    queryKey: ["profile", "recent", recent],
    queryFn: ({ signal }) => getManyPokemonCards(recent, { signal }),
    enabled: recent.length > 0,
    staleTime: 1000 * 60 * 30,
  });

  const joined = user.createdAt ? new Date(user.createdAt) : null;
  const joinedLabel = joined
    ? joined.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="surface flex flex-col items-start gap-5 rounded-3xl p-6 shadow-card sm:flex-row sm:items-center sm:gap-6 sm:p-8"
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-surface-muted sm:h-24 sm:w-24">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl font-bold text-foreground/40">
              {(user.name ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {user.name ?? "Trainer"}
          </h1>
          {user.email ? (
            <p className="text-sm text-foreground/70">{user.email}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/60">
            {joinedLabel ? <span>Joined {joinedLabel}</span> : null}
            {profile && profile.providers.length > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span>via {profile.providers.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")}</span>
              </>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full bg-foreground/5 px-4 py-2 text-sm font-medium transition hover:bg-foreground/10"
        >
          Sign out
        </button>
      </motion.section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Favorites" value={profile?.favoriteCount ?? 0} />
        <Stat
          label="Account"
          value={persistenceEnabled ? "Synced" : "Local"}
          hint={persistenceEnabled ? "Across devices" : "This device"}
        />
        <Stat label="Trainer ID" value={user.id.slice(0, 8)} mono />
      </section>

      <section className="surface rounded-3xl p-6 shadow-card sm:p-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/60">
            Recent Favorites
          </h2>
          <Link
            href="/favorites"
            className="text-xs font-medium text-foreground/70 hover:underline"
          >
            View all →
          </Link>
        </div>

        {!persistenceEnabled ? (
          <p className="text-sm text-foreground/60">
            Server sync isn&apos;t configured. Favorites stay on this device only.
          </p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-foreground/60">
            You haven&apos;t favorited any Pokémon yet. Tap the heart on a card to start.
          </p>
        ) : recentQuery.data && recentQuery.data.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {recentQuery.data.map((p) => (
              <RecentCard key={p.id} id={p.id} name={p.name} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: recent.length }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-surface-muted"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  mono,
}: {
  label: string;
  value: string | number;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="surface rounded-2xl p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/50">
        {label}
      </div>
      <div className={`mt-1 text-xl font-bold ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[11px] text-foreground/60">{hint}</div>
      ) : null}
    </div>
  );
}

function RecentCard({ id, name }: { id: number; name: string }) {
  const [src, setSrc] = useState(spriteUrl(id));
  return (
    <Link
      href={`/pokemon/${name}`}
      prefetch={false}
      className="group surface relative flex aspect-square flex-col items-center justify-center rounded-2xl border border-border p-1 transition hover:bg-surface-muted"
    >
      <span className="absolute left-2 top-1.5 text-[9px] font-mono text-foreground/40">
        {paddedId(id)}
      </span>
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt={name}
          fill
          sizes="120px"
          className="object-contain transition-transform duration-300 group-hover:scale-110"
          onError={() => setSrc(fallbackSprite(id))}
          unoptimized
        />
      </div>
      <span className="mt-1 max-w-full truncate px-1 text-center text-[10px] font-medium capitalize">
        {formatPokemonName(name)}
      </span>
    </Link>
  );
}
