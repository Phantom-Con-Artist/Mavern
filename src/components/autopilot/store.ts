"use client";

import { useSyncExternalStore } from "react";

/** The autopilot's state, shared by the engine on the page and the toggle in the header. */
export type AutopilotState = { available: boolean; on: boolean; finished: boolean };

let state: AutopilotState = { available: false, on: false, finished: false };
const listeners = new Set<() => void>();
/** The engine registers how to start and stop; the toggle calls these. */
export const controls = { start: () => {}, stop: () => {} };

export function setAutopilot(next: Partial<AutopilotState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

const server: AutopilotState = { available: false, on: false, finished: false };

export function useAutopilot(): AutopilotState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => server,
  );
}
