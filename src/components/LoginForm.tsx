"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

interface Props {
  authConfigured: boolean;
}

export default function LoginForm({ authConfigured }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="surface w-full rounded-3xl p-8 shadow-card"
      >
        <div
          className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent text-2xl font-bold text-white"
          aria-hidden
        >
          P
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, trainer</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Sign in to sync your trainer profile. Favorites are kept locally so they work without an account.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {authConfigured ? (
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
            >
              <span className="font-bold" aria-hidden>
                ⚡
              </span>
              Continue with GitHub
            </button>
          ) : (
            <div className="rounded-2xl bg-surface-muted p-4 text-left text-xs text-foreground/70">
              <strong>Auth not configured.</strong> Add{" "}
              <code className="rounded bg-foreground/10 px-1">GITHUB_ID</code>,{" "}
              <code className="rounded bg-foreground/10 px-1">GITHUB_SECRET</code>{" "}
              and{" "}
              <code className="rounded bg-foreground/10 px-1">NEXTAUTH_SECRET</code>{" "}
              to <code className="rounded bg-foreground/10 px-1">.env.local</code> to enable sign-in. Browse the dex without signing in.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
