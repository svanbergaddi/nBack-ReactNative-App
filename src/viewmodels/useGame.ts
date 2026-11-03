// VIEWMODEL · Game: round state, event timer, speech, commands.

import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';

import { insertScore } from '../data/scoreDb';
import {
  activeModalities,
  advanceEvent,
  computeMaxScore,
  computeScore,
  createIdleState,
  registerPress,
  startRound,
} from '../domain/engine';
import { LETTERS, Modality, Settings } from '../domain/types';

/**
 * Game screen ViewModel: holds the round state, runs the event timer, speaks letters,
 * and exposes state + commands. It never navigates; the screen decides that.
 */
export function useGame(settings: Settings) {
  const [state, setState] = useState(() => createIdleState(settings));
  const { phase, currentEventIndex } = state;
  const modalities = activeModalities(settings.mode);
  const isAudioActive = modalities.includes('audio');

  // Event timer. Runs only while `running`; the cleanup cancels it when the round
  // finishes or is quit (phase changes) and when the screen unmounts.
  useEffect(() => {
    if (phase !== 'running') return;
    const timerId = setInterval(() => setState(advanceEvent), settings.eventDurationMs);
    return () => clearInterval(timerId);
  }, [phase, settings.eventDurationMs]);

  // Speak the letter whenever a new event starts. Only reachable after the player taps Start.
  useEffect(() => {
    if (phase !== 'running' || !isAudioActive) return;
    // Lowercase: iOS reads a single uppercase letter as "capital C".
    Speech.speak(LETTERS[state.letterSequence[currentEventIndex]].toLowerCase());
  }, [phase, currentEventIndex, isAudioActive, state.letterSequence]);

  // Stop any speech still playing when the screen unmounts.
  useEffect(() => () => void Speech.stop(), []);

  return {
    state,
    modalities,
    /** Grid cell to light up, or null when no round is running. */
    litCell: phase === 'running' && modalities.includes('position') ? state.positionSequence[currentEventIndex] : null,
    correctSoFar: modalities.reduce((sum, modality) => sum + state.stats[modality].hits, 0),
    score: computeScore(state),
    maxScore: computeMaxScore(settings),
    startRound: () => setState(startRound(settings, Math.random)),
    quitRound: () => setState(createIdleState(settings)),
    pressMatch: (modality: Modality) => setState((current) => registerPress(current, modality)),
    saveScore: (name: string) => insertScore({ name, score: computeScore(state), n: settings.n, mode: settings.mode }),
  };
}
