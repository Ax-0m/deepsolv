"use client";

import { create } from "zustand";

export type ToastVariant = "catch" | "release" | "info";

export interface Toast {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  spriteId?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `t_${Date.now()}_${counter}`;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => {
      const next: Toast = { ...t, id: nextId() };
      const trimmed = s.toasts.length >= 4 ? s.toasts.slice(-3) : s.toasts;
      return { toasts: [...trimmed, next] };
    }),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
