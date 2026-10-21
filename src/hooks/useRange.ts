"use client";

import { transform, useTransform, type MotionValue } from "motion/react";

/**
 * Maps a scroll value through ranges, like useTransform(value, input, output), but as a plain function.
 * Motion hands range-mapped opacity on scroll to the browser's scroll timeline, which can stop short of
 * the end value; a function keeps it on the main thread and exact.
 */
export function useRange<T extends number | string>(value: MotionValue<number>, input: number[], output: T[]): MotionValue<T> {
  return useTransform(value, (v) => transform(v, input, output) as T);
}
