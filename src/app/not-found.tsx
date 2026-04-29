import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="text-5xl font-bold" aria-hidden>
        404
      </div>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-foreground/60">
        The page you&apos;re looking for doesn&apos;t exist.
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
