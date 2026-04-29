"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { spriteUrl } from "@/lib/pokeapi";
import { useToastStore, type Toast } from "@/store/toasts";
import PokeBall from "./PokeBall";

const TOAST_DURATION = 2800;

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-3 sm:items-end sm:right-6 sm:left-auto sm:px-0"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} dismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  dismiss,
}: {
  toast: Toast;
  dismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);

  const isCatch = toast.variant === "catch";
  const isRelease = toast.variant === "release";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onClick={() => dismiss(toast.id)}
      className="pointer-events-auto flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-md border-4 border-dex-black bg-surface px-3 py-2.5 shadow-pixel sm:w-80"
      role="status"
    >
      <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-sm border-2 border-dex-black bg-dex-screen-mid scanlines-overlay">
        {toast.spriteId ? (
          <Image
            src={spriteUrl(toast.spriteId)}
            alt=""
            fill
            sizes="48px"
            className="object-contain p-1"
            style={{ filter: "drop-shadow(1px 2px 0 rgba(0,0,0,0.4))" }}
            unoptimized
          />
        ) : (
          <PokeBall size={32} caught={isCatch} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`pixel-text text-[8px] ${
            isCatch
              ? "text-dex-red"
              : isRelease
                ? "text-amber-700 dark:text-amber-400"
                : "text-foreground/70"
          }`}
        >
          {toast.title}
        </div>
        <div className="pixel-mono truncate text-base font-bold leading-tight text-foreground">
          {toast.message}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismiss(toast.id);
        }}
        aria-label="Dismiss"
        className="pixel-text grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-foreground/10 text-[10px] text-foreground/60 transition hover:bg-foreground/20"
      >
        ×
      </button>
    </motion.div>
  );
}
