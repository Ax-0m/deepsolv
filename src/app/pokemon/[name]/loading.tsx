export default function Loading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="h-8 w-20 animate-pulse rounded-full bg-surface-muted" />
      <div className="surface overflow-hidden rounded-3xl shadow-card">
        <div className="grid grid-cols-1 gap-6 bg-surface-muted p-6 sm:grid-cols-[280px_1fr] sm:p-8">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-foreground/5" />
          <div className="flex flex-col gap-3">
            <div className="h-4 w-16 animate-pulse rounded bg-foreground/10" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-foreground/10" />
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-foreground/10" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-foreground/10" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-full animate-pulse rounded-full bg-surface-muted"
              />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-full animate-pulse rounded-xl bg-surface-muted"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
