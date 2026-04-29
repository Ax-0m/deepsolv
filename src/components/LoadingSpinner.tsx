import PokeBall from "./PokeBall";

export default function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16 text-foreground/70"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div
          className="animate-spin3d"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
        >
          <PokeBall size={56} />
        </div>
        <div className="mt-2 h-1.5 w-12 rounded-full bg-black/15 blur-sm mx-auto animate-pulse" />
      </div>
      <span className="pixel-text text-[10px] text-foreground/70 animate-blink">
        {label.replace(/…$/, "")}
        <span aria-hidden>...</span>
      </span>
    </div>
  );
}
