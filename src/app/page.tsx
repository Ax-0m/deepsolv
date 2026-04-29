import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import HomeView from "@/components/HomeView";
import { CardSkeletonGrid } from "@/components/PokemonGrid";
import {
  getAllTypes,
  getManyPokemonCards,
  getPokemonPage,
} from "@/lib/pokeapi";

interface PageProps {
  searchParams: { q?: string; type?: string; page?: string };
}

const PAGE_SIZE = 20;

export const revalidate = 3600;

export default async function Home({ searchParams }: PageProps) {
  const qc = new QueryClient();
  const isDefaultView =
    !searchParams.q &&
    !searchParams.type &&
    (!searchParams.page || Number(searchParams.page) === 1);

  await qc.prefetchQuery({
    queryKey: ["pokemon", "types"],
    queryFn: () => getAllTypes(),
  });

  if (isDefaultView) {
    try {
      const page = await getPokemonPage(0, PAGE_SIZE);
      qc.setQueryData(["pokemon", "page", 1, PAGE_SIZE], page);
      const names = page.items.map((p) => p.name);
      const cards = await getManyPokemonCards(names);
      qc.setQueryData(["pokemon", "cards-batch", names], cards);
    } catch {}
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <CardSkeletonGrid />
          </div>
        }
      >
        <HomeView />
      </Suspense>
    </HydrationBoundary>
  );
}
