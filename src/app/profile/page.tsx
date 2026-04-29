import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isPersistenceEnabled } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile · Pokédex",
};

interface ProfileData {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: Date | null;
  };
  favoriteCount: number;
  recentFavorites: number[];
  providers: string[];
}

async function loadProfile(userId: string): Promise<ProfileData | null> {
  if (!isPersistenceEnabled) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        accounts: { select: { provider: true } },
        _count: { select: { favorites: true } },
      },
    });
    if (!user) return null;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      favoriteCount: user._count.favorites,
      recentFavorites: user.favorites.map((f) => f.pokemonId),
      providers: user.accounts.map((a) => a.provider),
    };
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const profile = await loadProfile(session.user.id);

  return (
    <ProfileView
      profile={profile}
      sessionUser={session.user}
      persistenceEnabled={isPersistenceEnabled}
    />
  );
}
