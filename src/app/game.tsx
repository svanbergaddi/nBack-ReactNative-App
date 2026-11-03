import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Grid } from '../components/Grid';
import { MatchButton } from '../components/MatchButton';
import { DEFAULT_SETTINGS } from '../domain/types';
import { useGame } from '../viewmodels/useGame';

const MATCH_LABELS = { position: 'Position', audio: 'Sound' } as const;

/** Game screen: HUD, grid, match buttons, and start / quit / play-again controls. */
export default function GameScreen() {
  const settings = DEFAULT_SETTINGS;
  const game = useGame(settings);
  const { phase, currentEventIndex } = game.state;

  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: `${settings.n}-back` }} />

      <View style={styles.hud}>
        <Text style={styles.hudText}>
          Event {phase === 'idle' ? 0 : currentEventIndex + 1} / {settings.eventsPerRound}
        </Text>
        <Text style={styles.hudText}>Correct: {game.correctSoFar}</Text>
      </View>

      {game.modalities.includes('position') && (
        <Grid gridSize={settings.gridSize} litCell={game.litCell} eventIndex={currentEventIndex} />
      )}

      {phase === 'running' ? (
        <View style={styles.controls}>
          <View style={styles.matchRow}>
            {game.modalities.map((modality) => (
              <MatchButton
                key={modality}
                label={MATCH_LABELS[modality]}
                falseAlarmCount={game.state.stats[modality].falseAlarms}
                onPress={() => game.pressMatch(modality)}
              />
            ))}
          </View>
          <Pressable onPress={game.quitRound} accessibilityRole="button">
            <Text style={styles.quit}>Quit round</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.controls}>
          {phase === 'finished' && <Text style={styles.result}>Round over. Score: {game.score} / {game.maxScore}</Text>}
          <Pressable style={styles.startButton} onPress={game.startRound} accessibilityRole="button">
            <Text style={styles.startLabel}>{phase === 'finished' ? 'Play again' : 'Start'}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  hudText: { fontSize: 18, fontVariant: ['tabular-nums'] },
  controls: { alignSelf: 'stretch', alignItems: 'center', gap: 16 },
  matchRow: { flexDirection: 'row', alignSelf: 'stretch', gap: 12 },
  quit: { fontSize: 16, color: '#6b7280', padding: 12 },
  result: { fontSize: 22, fontWeight: '600' },
  startButton: { alignSelf: 'stretch', minHeight: 64, borderRadius: 16, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  startLabel: { fontSize: 20, fontWeight: '600', color: 'white' },
});
