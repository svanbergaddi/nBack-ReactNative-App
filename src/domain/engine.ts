import { countMatchesToPlace, generateSequence, isMatch } from './sequence';
import { GameMode, GameState, MATCH_RATE, Modality, Rng, Settings } from './types';

const NO_PRESSES: Record<Modality, boolean> = { position: false, audio: false };
const ZERO_STATS = { hits: 0, misses: 0, falseAlarms: 0 };

/** Modalities the player tracks in the given mode. */
export function activeModalities(mode: GameMode): Modality[] {
  if (mode === 'dual') return ['position', 'audio'];
  return mode === 'visual' ? ['position'] : ['audio'];
}

function sequenceFor(state: GameState, modality: Modality): number[] {
  return modality === 'position' ? state.positionSequence : state.letterSequence;
}

/** State before a round has started (also used after quitting mid-round). */
export function createIdleState(settings: Settings): GameState {
  return {
    phase: 'idle',
    settings,
    positionSequence: [],
    letterSequence: [],
    currentEventIndex: 0,
    hasPressedThisEvent: NO_PRESSES,
    stats: { position: ZERO_STATS, audio: ZERO_STATS },
  };
}

/** idle/finished → running: generates both sequences and resets counters. */
export function startRound(settings: Settings, rng: Rng): GameState {
  const common = { length: settings.eventsPerRound, n: settings.n, matchRate: MATCH_RATE, rng };
  return {
    ...createIdleState(settings),
    phase: 'running',
    positionSequence: generateSequence({ ...common, alphabetSize: settings.gridSize ** 2 }),
    letterSequence: generateSequence({ ...common, alphabetSize: settings.letterCount }),
  };
}

/**
 * Registers a match press for one modality: a hit if the current event is a match,
 * otherwise a false alarm. Ignored (same state returned) when not running,
 * during the first n events, or if this modality was already pressed this event.
 */
export function registerPress(state: GameState, modality: Modality): GameState {
  const { phase, currentEventIndex, settings, hasPressedThisEvent } = state;
  if (phase !== 'running' || currentEventIndex < settings.n || hasPressedThisEvent[modality]) {
    return state;
  }
  const stats = state.stats[modality];
  const isHit = isMatch(sequenceFor(state, modality), currentEventIndex, settings.n);
  return {
    ...state,
    hasPressedThisEvent: { ...hasPressedThisEvent, [modality]: true },
    stats: {
      ...state.stats,
      [modality]: isHit ? { ...stats, hits: stats.hits + 1 } : { ...stats, falseAlarms: stats.falseAlarms + 1 },
    },
  };
}

/**
 * Ends the current event (timer tick): counts a miss for every active modality whose
 * match went unpressed, then moves to the next event, or to `finished` after the last one.
 */
export function advanceEvent(state: GameState): GameState {
  if (state.phase !== 'running') return state;
  const { currentEventIndex, settings } = state;

  const stats = { ...state.stats };
  for (const modality of activeModalities(settings.mode)) {
    const isMissed =
      !state.hasPressedThisEvent[modality] &&
      isMatch(sequenceFor(state, modality), currentEventIndex, settings.n);
    if (isMissed) stats[modality] = { ...stats[modality], misses: stats[modality].misses + 1 };
  }

  const isLastEvent = currentEventIndex === settings.eventsPerRound - 1;
  return {
    ...state,
    stats,
    phase: isLastEvent ? 'finished' : 'running',
    currentEventIndex: isLastEvent ? currentEventIndex : currentEventIndex + 1,
    hasPressedThisEvent: NO_PRESSES,
  };
}

/** Score = hits − false alarms over the active modalities, floored at 0 so it is never negative. */
export function computeScore(state: GameState): number {
  const total = activeModalities(state.settings.mode).reduce(
    (sum, modality) => sum + state.stats[modality].hits - state.stats[modality].falseAlarms,
    0,
  );
  return Math.max(0, total);
}

/**
 * Best possible score for these settings: every match hit, no false alarms.
 * Fixed per settings because each sequence has an exact number of matches.
 */
export function computeMaxScore(settings: Settings): number {
  const matchesPerModality = countMatchesToPlace(settings.eventsPerRound, settings.n, MATCH_RATE);
  return matchesPerModality * activeModalities(settings.mode).length;
}
