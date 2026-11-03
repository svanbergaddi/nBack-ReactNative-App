// VIEWMODEL · Scores: high score for Home.

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getHighScore } from '../data/scoreDb';

/** Score ViewModel: the high score and its holder, re-read from the database each time the screen gains focus. */
export function useScores() {
  const [highScore, setHighScore] = useState<{ name: string; score: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      getHighScore().then(setHighScore);
    }, []),
  );

  return { highScore };
}
