import { createHash } from "node:crypto";

export type MatchingSide = "left" | "right";

export function getMatchingOptionId(questionId: string, side: MatchingSide, itemId: string) {
  return createHash("sha256").update(`${questionId}:${side}:${itemId}`).digest("hex").slice(0, 24);
}

export function stableShuffle<T>(items: T[], getKey: (item: T) => string, seed: string) {
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  return [...items].sort((a, b) => {
    const comparison = hash(`${seed}:${getKey(a)}`).localeCompare(hash(`${seed}:${getKey(b)}`));
    return comparison || getKey(a).localeCompare(getKey(b));
  });
}
