import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="text-5xl" aria-hidden>
        ?
      </div>
      <h1 className="text-2xl font-bold">Pokémon not found</h1>
      <p className="text-sm text-foreground/60">
        We couldn&apos;t find that Pokémon in the Pokédex. Try searching from the home page.
      </p>
      <Link
        href="/"
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
