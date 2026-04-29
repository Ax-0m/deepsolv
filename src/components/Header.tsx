"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useFavorites } from "@/hooks/useFavorites";
import { useSoundStore } from "@/store/sound";
import { useSounds } from "@/hooks/useSounds";
import PokeBall from "./PokeBall";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { ids, isReady } = useFavorites();
  const hydrated = isReady;
  const favoriteCount = ids.length;
  const muted = useSoundStore((s) => s.muted);
  const toggleMute = useSoundStore((s) => s.toggleMute);
  const { play } = useSounds();

  const links = [
    { href: "/", label: "Home" },
    { href: "/favorites", label: "Favs" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b-4 border-dex-red-deep dex-bevel">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link
          href="/"
          onClick={() => play("click")}
          className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-white"
        >
          <span className="relative grid place-items-center">
            <PokeBall size={32} />
            <span className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-white/30" />
          </span>
          <span
            className="pixel-text text-base leading-none text-white"
            style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.35)" }}
          >
            Pokédex
          </span>
        </Link>

        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
          <span className="h-3 w-3 rounded-full border border-white/40 bg-yellow-300 shadow-pixel-inset animate-blink" />
          <span className="h-2 w-2 rounded-full border border-white/40 bg-emerald-400 shadow-pixel-inset" />
          <span className="h-2 w-2 rounded-full border border-white/40 bg-red-400 shadow-pixel-inset" />
        </div>

        <nav className="ml-1 flex items-center gap-1 text-xs">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => play("click")}
                className={`pixel-text relative rounded-sm px-2.5 py-1.5 text-[10px] transition ${
                  active
                    ? "bg-white text-dex-red-deep shadow-pixel-inset"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                {link.label}
                {link.href === "/favorites" && hydrated && favoriteCount > 0 ? (
                  <span
                    className={`pixel-text ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm px-1 text-[8px] ${
                      active
                        ? "bg-dex-red-deep text-white"
                        : "bg-yellow-300 text-dex-red-deep"
                    }`}
                  >
                    {favoriteCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              toggleMute();
              if (muted) play("open");
            }}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            title={muted ? "Sounds: off" : "Sounds: on"}
            className="grid h-8 w-8 place-items-center rounded-sm bg-white/10 text-white transition hover:bg-white/20 shadow-pixel-inset"
          >
            <span className="pixel-text text-xs" aria-hidden>
              {muted ? "♪̸" : "♪"}
            </span>
          </button>

          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-sm bg-white/15" />
          ) : session?.user ? (
            <Link
              href="/profile"
              onClick={() => play("click")}
              aria-label="View profile"
              className="flex items-center gap-2 rounded-sm bg-white/10 py-1 pl-1 pr-2.5 text-white shadow-pixel-inset transition hover:bg-white/20"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-sm bg-white/30 text-xs font-bold">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (session.user.name ?? "T").charAt(0).toUpperCase()
                )}
              </span>
              <span className="pixel-text hidden text-[9px] sm:inline">
                {session.user.name?.split(" ")[0] ?? "Profile"}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                play("click");
                const query = searchParams?.toString();
                const callbackUrl = pathname
                  ? query
                    ? `${pathname}?${query}`
                    : pathname
                  : "/";
                signIn(undefined, { callbackUrl });
              }}
              className="pixel-btn rounded-sm bg-yellow-300 px-2.5 py-1.5 text-[9px] text-dex-red-deep"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
