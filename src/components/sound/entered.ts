"use client";

import { useSyncExternalStore } from "react";

/** Whether the visitor is past the entry screen, so the opening can wait for them. */
let entered = false;
const listeners = new Set<() => void>();

export function enter() {
  entered = true;
  listeners.forEach((l) => l());
}

export function useEntered(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => entered,
    () => false,
  );
}
