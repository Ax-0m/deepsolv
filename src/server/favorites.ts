"use server";

import { getServerSession } from "next-auth";
import { authOptions, isPersistenceEnabled } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface FavoritesActionResult {
  ok: boolean;
  ids: number[];
  error?: string;
}

async function requireUserId(): Promise<string | null> {
  if (!isPersistenceEnabled) return null;
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getServerFavorites(): Promise<FavoritesActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, ids: [], error: "unauthenticated" };

  try {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { pokemonId: true },
    });
    return { ok: true, ids: rows.map((r) => r.pokemonId) };
  } catch (e) {
    return {
      ok: false,
      ids: [],
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}

export async function addServerFavorite(
  pokemonId: number,
): Promise<FavoritesActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, ids: [], error: "unauthenticated" };
  if (!Number.isInteger(pokemonId) || pokemonId <= 0) {
    return { ok: false, ids: [], error: "invalid id" };
  }

  try {
    await prisma.favorite.upsert({
      where: { userId_pokemonId: { userId, pokemonId } },
      create: { userId, pokemonId },
      update: {},
    });
    return { ok: true, ids: [] };
  } catch (e) {
    return {
      ok: false,
      ids: [],
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}

export async function removeServerFavorite(
  pokemonId: number,
): Promise<FavoritesActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, ids: [], error: "unauthenticated" };

  try {
    await prisma.favorite.deleteMany({ where: { userId, pokemonId } });
    return { ok: true, ids: [] };
  } catch (e) {
    return {
      ok: false,
      ids: [],
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}

export async function syncLocalFavorites(
  ids: number[],
): Promise<FavoritesActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, ids: [], error: "unauthenticated" };

  const cleaned = Array.from(
    new Set(ids.filter((n) => Number.isInteger(n) && n > 0)),
  );

  if (cleaned.length === 0) return getServerFavorites();

  try {
    await prisma.favorite.createMany({
      data: cleaned.map((pokemonId) => ({ userId, pokemonId })),
      skipDuplicates: true,
    });
    return getServerFavorites();
  } catch (e) {
    return {
      ok: false,
      ids: [],
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}

export async function clearServerFavorites(): Promise<FavoritesActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, ids: [], error: "unauthenticated" };

  try {
    await prisma.favorite.deleteMany({ where: { userId } });
    return { ok: true, ids: [] };
  } catch (e) {
    return {
      ok: false,
      ids: [],
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}
