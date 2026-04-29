import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FavoritesView from "@/components/FavoritesView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favorites · Pokédex",
  description: "Your saved Pokémon.",
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/favorites")}`);
  }
  return <FavoritesView />;
}
