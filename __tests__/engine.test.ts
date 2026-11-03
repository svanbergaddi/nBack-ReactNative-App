import { describe, expect, it } from '@jest/globals';
import {
  advanceEvent,
  computeScore,
  createIdleState,
  registerPress,
  startRound,
} from '../src/domain/engine';
import { createSeededRng, isMatch } from '../src/domain/sequence';
import { DEFAULT_SETTINGS, GameState } from '../src/domain/types';

const settings = { ...DEFAULT_SETTINGS, mode: 'dual' as const, n: 2, eventsPerRound: 20 };

function newRound(): GameState {
  return startRound(settings, createSeededRng(7));
}

function advanceTo(state: GameState, index: number): GameState {
  while (state.currentEventIndex < index) state = advanceEvent(state);
  return state;
}

/** First event index (≥ n) where the position stream is / is not a match. */
function findPositionEvent(state: GameState, wantMatch: boolean): number {
  const index = state.positionSequence.findIndex(
    (_, i) => i >= settings.n && isMatch(state.positionSequence, i, settings.n) === wantMatch,
  );
  expect(index).toBeGreaterThanOrEqual(settings.n);
  return index;
}

describe('registerPress guards', () => {
  // Fails if: the `phase !== 'running'` check is removed.
  it('ignores a press before the round starts and after it ends', () => {
    const idle = createIdleState(settings);
    expect(registerPress(idle, 'position')).toBe(idle);

    const finished = advanceTo(newRound(), settings.eventsPerRound - 1);
    const ended = advanceEvent(finished);
    expect(ended.phase).toBe('finished');
    expect(registerPress(ended, 'position')).toBe(ended);
  });

  // Fails if: the `currentEventIndex < settings.n` check is removed.
  it('ignores presses during the first n events', () => {
    let state = newRound();
    for (let i = 0; i < settings.n; i++) {
      expect(registerPress(state, 'position')).toBe(state);
      expect(registerPress(state, 'audio')).toBe(state);
      state = advanceEvent(state);
    }
  });

  // Fails if: the `hasPressedThisEvent[modality]` check is removed (second press would add a false alarm or hit).
  it('ignores a second press of the same modality on the same event', () => {
    const round = newRound();
    const state = advanceTo(round, findPositionEvent(round, false));
    const afterFirst = registerPress(state, 'position');
    expect(afterFirst.stats.position.falseAlarms).toBe(1);
    expect(registerPress(afterFirst, 'position')).toBe(afterFirst);
  });

  // Fails if: the press flag is not reset in advanceEvent.
  it('accepts a press again on the next event', () => {
    const round = newRound();
    const pressed = registerPress(advanceTo(round, settings.n), 'position');
    const next = advanceEvent(pressed);
    expect(next.hasPressedThisEvent.position).toBe(false);
  });
});

describe('counting and scoring', () => {
  // Fails if: hit and false alarm branches are swapped in registerPress.
  it('counts a press on a match as a hit and on a non-match as a false alarm', () => {
    const round = newRound();
    const onMatch = registerPress(advanceTo(round, findPositionEvent(round, true)), 'position');
    expect(onMatch.stats.position).toMatchObject({ hits: 1, falseAlarms: 0 });

    // Skipping ahead may count earlier matches as misses, so only hits/false alarms are checked.
    const onNonMatch = registerPress(advanceTo(round, findPositionEvent(round, false)), 'position');
    expect(onNonMatch.stats.position).toMatchObject({ hits: 0, falseAlarms: 1 });
  });

  // Fails if: advanceEvent stops counting misses, or counts misses during the first n events.
  it('counts every unpressed match as a miss over a silent round', () => {
    let state = newRound();
    while (state.phase === 'running') state = advanceEvent(state);
    const expectedMisses = state.positionSequence.filter((_, i) =>
      isMatch(state.positionSequence, i, settings.n),
    ).length;
    expect(state.stats.position.misses).toBe(expectedMisses);
    expect(state.stats.position.hits + state.stats.position.falseAlarms).toBe(0);
  });

  // Fails if: the round ends one event early or late.
  it('finishes after exactly eventsPerRound ticks', () => {
    let state = newRound();
    for (let tick = 1; tick < settings.eventsPerRound; tick++) state = advanceEvent(state);
    expect(state.phase).toBe('running');
    expect(advanceEvent(state).phase).toBe('finished');
  });

  // Fails if: Math.max(0, …) is removed, or false alarms are not subtracted.
  it('scores hits minus false alarms, never below 0', () => {
    const base = createIdleState(settings);
    const withStats = (hits: number, falseAlarms: number) => ({
      ...base,
      stats: {
        position: { hits, misses: 0, falseAlarms },
        audio: { hits, misses: 0, falseAlarms: 0 },
      },
    });
    expect(computeScore(withStats(3, 1))).toBe(5); // (3 − 1) + 3
    expect(computeScore(withStats(0, 4))).toBe(0); // −4 floored at 0
  });
});
