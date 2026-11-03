// VIEW · Game screen: HUD, grid, match buttons, save score.

import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Grid } from '../components/Grid';
import { MatchButton } from '../components/MatchButton';
import { COLORS, OUTLINE } from '../components/theme';
import { useGame } from '../viewmodels/useGame';
import { useSettings } from '../viewmodels/useSettings';

const MATCH_LABELS = { position: 'Position', audio: 'Sound' } as const;
const MATCH_EMOJI = { position: '🟨', audio: '🔊' } as const; // gold square = the lit grid cell

/** Game screen: HUD, grid, match buttons, start / quit / play-again, and save-score form. */
export default function GameScreen() {
  const { settings } = useSettings();
  const game = useGame(settings);
  const { phase, currentEventIndex } = game.state;
  const [playerName, setPlayerName] = useState('');
  const canSave = playerName.trim() !== '';

  // After saving, go back to Home, which re-reads the high score when it regains focus.
  const saveAndGoHome = () => game.saveScore(playerName.trim()).then(() => router.back());

  return (
    <KeyboardAvoidingView style={styles.fill} behavior="padding">
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
                  emoji={MATCH_EMOJI[modality]}
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
            {phase === 'finished' && (
              <>
                <Text style={styles.result}>Round over. Score: {game.score} / {game.maxScore}</Text>
                <TextInput style={styles.nameInput} placeholder="Your name" placeholderTextColor={COLORS.muted} value={playerName} onChangeText={setPlayerName} maxLength={20} />
                <Pressable style={[styles.startButton, !canSave && styles.disabled]} disabled={!canSave} onPress={saveAndGoHome} accessibilityRole="button">
                  <Text style={styles.startLabel}>Save score</Text>
                </Pressable>
              </>
            )}
            <Pressable style={styles.startButton} onPress={game.startRound} accessibilityRole="button">
              <Text style={styles.startLabel}>{phase === 'finished' ? 'Play again' : 'Start'}</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  hudText: { fontSize: 18, fontWeight: '600', color: COLORS.text, fontVariant: ['tabular-nums'] },
  controls: { alignSelf: 'stretch', alignItems: 'center', gap: 16 },
  matchRow: { flexDirection: 'row', alignSelf: 'stretch', gap: 12 },
  quit: { fontSize: 16, color: COLORS.muted, padding: 12 },
  result: { fontSize: 22, fontWeight: '700', color: COLORS.gold },
  startButton: { alignSelf: 'stretch', minHeight: 64, borderRadius: 16, borderWidth: OUTLINE, borderColor: COLORS.gold, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  startLabel: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
  nameInput: { alignSelf: 'stretch', minHeight: 48, borderWidth: OUTLINE, borderColor: COLORS.gold, borderRadius: 12, backgroundColor: COLORS.surface, color: COLORS.text, paddingHorizontal: 16, fontSize: 18 },
  disabled: { opacity: 0.4 },
});
