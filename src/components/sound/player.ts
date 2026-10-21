"use client";

import { useSyncExternalStore } from "react";
import { SOUND_KEY, soundWanted } from "./preference";

/*
  The site's one music player: "Dreams" by Lost Sky (NCS), shared by the entry screen and the header's
  tape-deck readout. It fades in and out, remembers an "off" choice, and pauses with the tab.
*/

const SRC = "/media/lost-sky-dreams.m4a";
const VOLUME = 0.45;

type State = { wanted: boolean; playing: boolean };

let audio: HTMLAudioElement | null = null;
let state: State = { wanted: true, playing: false };
let fade = 0;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function store(value: "on" | "off") {
  try {
    localStorage.setItem(SOUND_KEY, value);
  } catch {
    /* Private windows may refuse; the choice then lasts for this visit. */
  }
}

function element(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio(SRC);
  audio.loop = true;
  audio.preload = "auto";
  audio.addEventListener("play", () => set({ playing: true }));
  audio.addEventListener("pause", () => set({ playing: false }));
  document.addEventListener("visibilitychange", () => {
    if (!audio) return;
    if (document.hidden) audio.pause();
    else if (state.wanted && audio.currentTime > 0) void play();
  });
  return audio;
}

function fadeTo(target: number, then?: () => void) {
  const el = element();
  cancelAnimationFrame(fade);
  const start = el.volume;
  const t0 = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / 1200);
    el.volume = start + (target - start) * t;
    if (t < 1) fade = requestAnimationFrame(step);
    else then?.();
  };
  fade = requestAnimationFrame(step);
}

/** Starts the music; rejects when the browser wants a tap first. */
export function play(): Promise<void> {
  const el = element();
  if (!el.paused) return Promise.resolve();
  el.volume = 0;
  return el.play().then(() => fadeTo(VOLUME));
}

export function turnOn() {
  set({ wanted: true });
  store("on");
  return play().catch(() => undefined);
}

export function turnOff() {
  set({ wanted: false });
  store("off");
  if (audio && !audio.paused) fadeTo(0, () => audio?.pause());
}

/** What the visitor chose last time: true unless they turned the music off. */
export function remembered(): boolean {
  try {
    return soundWanted(localStorage.getItem(SOUND_KEY));
  } catch {
    return true;
  }
}

/** Seconds into the track, for the tape counter. */
export function position(): number {
  return audio?.currentTime ?? 0;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const server: State = { wanted: true, playing: false };

export function useSound(): State {
  return useSyncExternalStore(subscribe, () => state, () => server);
}
