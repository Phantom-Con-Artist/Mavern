import { describe, expect, it } from "vitest";
import { splitLetters } from "@/lib/splitLetters";

describe("splitLetters", () => {
  it("splits a word into letters", () => {
    expect(splitLetters("Mavern").map((l) => l.char)).toEqual(["M", "a", "v", "e", "r", "n"]);
  });

  it("marks spaces", () => {
    expect(splitLetters("A B").map((l) => l.space)).toEqual([false, true, false]);
  });

  it("keeps a flag emoji as one letter", () => {
    expect(splitLetters("🇮🇳x")).toHaveLength(2);
  });

  it("gives every letter a unique key", () => {
    const keys = splitLetters("aaaa").map((l) => l.key);
    expect(new Set(keys).size).toBe(4);
  });
});
