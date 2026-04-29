import type { Metadata } from "next";
import FavoritesView from "@/components/FavoritesView";

export const metadata: Metadata = {
  title: "Favorites · Pokédex",
  description: "Your saved Pokémon.",
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
