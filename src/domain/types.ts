/** A stimulus stream: which grid cell lights up, or which letter is spoken. */
export type Modality = 'position' | 'audio';

/** Which modalities are active in a round. */
export type GameMode = 'visual' | 'audio' | 'dual';

/** Round lifecycle: idle → running → finished. */
export type Phase = 'idle' | 'running' | 'finished';

/** Returns a number in [0, 1). Injected so tests can use a seeded generator. */
export type Rng = () => number;

/** Player-adjustable settings (persisted). */
export interface Settings {
  mode: GameMode;
  n: number;
  eventDurationMs: number;
  eventsPerRound: number;
  gridSize: number;
  letterCount: number;
}

/** Response counters for one modality. */
export interface ModalityStats {
  hits: number;
  misses: number;
  falseAlarms: number;
}

/** Complete state of a round. Treated as immutable; engine functions return new objects. */
export interface GameState {
  phase: Phase;
  settings: Settings;
  /** Grid cell index (0 .. gridSize² - 1) per event. */
  positionSequence: number[];
  /** Index into LETTERS per event. */
  letterSequence: number[];
  currentEventIndex: number;
  hasPressedThisEvent: Record<Modality, boolean>;
  stats: Record<Modality, ModalityStats>;
}

/** Phonetically distinct letters; the first `letterCount` are used. */
export const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

/** Share of events (from index n on) that are matches. Must stay within [0.2, 0.4]. */
export const MATCH_RATE = 0.3;

export const DEFAULT_SETTINGS: Settings = {
  mode: 'dual',
  n: 2,
  eventDurationMs: 2500,
  eventsPerRound: 20,
  gridSize: 3,
  letterCount: 8,
};
