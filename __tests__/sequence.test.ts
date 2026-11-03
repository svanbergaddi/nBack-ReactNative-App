import { describe, expect, it } from '@jest/globals';
import { createSeededRng, generateSequence, isMatch } from '../src/domain/sequence';
import { MATCH_RATE } from '../src/domain/types';

function generate(seed: number, length = 20, n = 2, alphabetSize = 9) {
  return generateSequence({ length, n, alphabetSize, matchRate: MATCH_RATE, rng: createSeededRng(seed) });
}

function countMatches(sequence: number[], n: number) {
  return sequence.filter((_, i) => isMatch(sequence, i, n)).length;
}

describe('generateSequence', () => {
  // Fails if: the loop runs the wrong number of times, or randomInt can return alphabetSize.
  it('has the requested length and only values inside the alphabet', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const sequence = generate(seed);
      expect(sequence).toHaveLength(20);
      sequence.forEach((value) => {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(9);
      });
    }
  });

  // Fails if: non-match entries can equal the value n back (extra matches), or too few matches are placed.
  it('contains exactly round(MATCH_RATE × (length − n)) matches, within 20–40 %', () => {
    for (let length = 10; length <= 50; length += 5) {
      for (let n = 1; n <= 5; n++) {
        const sequence = generate(length * 10 + n, length, n);
        const matchCount = countMatches(sequence, n);
        expect(matchCount).toBe(Math.round(MATCH_RATE * (length - n)));
        expect(matchCount / (length - n)).toBeGreaterThanOrEqual(0.2);
        expect(matchCount / (length - n)).toBeLessThanOrEqual(0.4);
      }
    }
  });

  // Fails if: match indices are picked from 0 instead of n (sequence[i - n] would be undefined).
  it('never places a match in the first n events', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const sequence = generate(seed, 20, 3);
      expect(sequence.slice(0, 3).every((value) => value !== undefined)).toBe(true);
      expect([0, 1, 2].some((i) => isMatch(sequence, i, 3))).toBe(false);
    }
  });

  // Fails if: the generator reads Math.random instead of the injected rng.
  it('is deterministic for a given seed', () => {
    expect(generate(42)).toEqual(generate(42));
  });
});
