// MODEL (domain) · Stimulus sequence generator, match check, seeded random.

import { Rng } from './types';

/**
 * Seeded pseudo-random generator (linear congruential, Numerical Recipes constants).
 * Same seed → same numbers, so tests are deterministic.
 */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    // state < 2^32, so the product stays below 2^53 and is exact in a JS number.
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

/** Random integer in [0, max). */
function randomInt(rng: Rng, max: number): number {
  return Math.floor(rng() * max);
}

/** True if event `index` repeats the value from n events earlier. Never true for index < n. */
export function isMatch(sequence: number[], index: number, n: number): boolean {
  return index >= n && sequence[index] === sequence[index - n];
}

/** Number of matches placed in a sequence: matchRate of the events after the first n. */
export function countMatchesToPlace(length: number, n: number, matchRate: number): number {
  return Math.round(matchRate * (length - n));
}

/**
 * Generates one stimulus sequence of values in [0, alphabetSize).
 * Invariants: the first n entries are never matches, and exactly
 * countMatchesToPlace(length, n, matchRate) of the remaining entries are matches.
 */
export function generateSequence(options: {
  length: number;
  n: number;
  alphabetSize: number;
  matchRate: number;
  rng: Rng;
}): number[] {
  const { length, n, alphabetSize, matchRate, rng } = options;
  const matchCount = countMatchesToPlace(length, n, matchRate);

  // Pick which indices (n .. length-1) become matches: shuffle the first matchCount slots into place.
  const candidates = Array.from({ length: length - n }, (_, k) => k + n);
  for (let k = 0; k < matchCount; k++) {
    const pick = k + randomInt(rng, candidates.length - k);
    [candidates[k], candidates[pick]] = [candidates[pick], candidates[k]];
  }
  const matchIndices = new Set(candidates.slice(0, matchCount));

  // Fill left to right so every value n steps back is already final.
  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    if (matchIndices.has(i)) {
      sequence.push(sequence[i - n]);
    } else if (i < n) {
      sequence.push(randomInt(rng, alphabetSize));
    } else {
      // Draw from the alphabet minus the value n back, so no accidental match appears.
      const value = randomInt(rng, alphabetSize - 1);
      sequence.push(value >= sequence[i - n] ? value + 1 : value);
    }
  }
  return sequence;
}
