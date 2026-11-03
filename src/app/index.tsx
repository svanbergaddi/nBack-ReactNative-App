// VIEW · Home screen: high score, mode choice, settings summary, Start.

import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, OUTLINE } from '../components/theme';
import { activeModalities, computeMaxScore } from '../domain/engine';
import { GameMode } from '../domain/types';
import { useScores } from '../viewmodels/useScores';
import { useSettings } from '../viewmodels/useSettings';

const MODE_LABELS: Record<GameMode, string> = { visual: 'Visual', audio: 'Audio', dual: 'Both' };
const MODE_TITLES: Record<GameMode, string> = { visual: 'Visual', audio: 'Audio', dual: 'Dual' };
const STIMULUS_TEXT: Record<GameMode, string> = {
  visual: 'a square lights up',
  audio: 'a letter is spoken',
  dual: 'a square lights up and a letter is spoken',
};

/** Home screen: high score, stimulus-mode choice, current settings, how to play, and Start. */
export default function HomeScreen() {
  const { settings, updateSettings } = useSettings();
  const { highScore } = useScores();
  const { n, mode } = settings;
  const modalities = activeModalities(mode);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{MODE_TITLES[mode]} {n}-back</Text>
      <Text style={styles.highScore}>
        {highScore ? `High score: ${highScore.score} · ${highScore.name}` : 'No high score yet'}
      </Text>

      <View style={styles.modeRow} accessibilityRole="radiogroup">
        {(Object.keys(MODE_LABELS) as GameMode[]).map((option) => (
          <Pressable
            key={option}
            style={[styles.modeOption, option === mode && styles.modeSelected]}
            onPress={() => updateSettings({ mode: option })}
            accessibilityRole="radio"
            accessibilityState={{ selected: option === mode }}
          >
            <Text style={[styles.modeLabel, option === mode && styles.modeLabelSelected]}>{MODE_LABELS[option]}</Text>
          </Pressable>
        ))}
      </View>

      {/* The settings card shows the current values and is also the way into Settings. */}
      <Link href="/settings" asChild>
        <Pressable style={styles.settingsCard} accessibilityRole="button" accessibilityHint="Opens settings">
          <Text style={styles.settingsTitle}>Game settings ›</Text>
          <Text style={styles.settingsValues}>
            n = {n} · {settings.eventDurationMs / 1000} s per event · {settings.eventsPerRound} events
          </Text>
        </Pressable>
      </Link>

      <Text style={styles.body}>
        Each step, {STIMULUS_TEXT[mode]}.
        {modalities.includes('position') && <>{'\n'}Tap <Text style={styles.bold}>Position</Text> when the square is in the same place as {n} steps ago.</>}
        {modalities.includes('audio') && <>{'\n'}Tap <Text style={styles.bold}>Sound</Text> when the letter is the same as {n} steps ago.</>}
        {'\n'}Score = correct taps − wrong taps. A perfect round scores {computeMaxScore(settings)}.
      </Text>

      <Link href="/game" asChild>
        <Pressable style={styles.startButton} accessibilityRole="button">
          <Text style={styles.startLabel}>Start</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.gold },
  highScore: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeOption: { minWidth: 88, minHeight: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: OUTLINE, borderColor: COLORS.gold, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  modeSelected: { backgroundColor: COLORS.purple },
  modeLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  modeLabelSelected: { color: COLORS.gold },
  settingsCard: { width: '100%', maxWidth: 420, padding: 16, gap: 4, borderRadius: 12, borderWidth: OUTLINE, borderColor: COLORS.gold, backgroundColor: COLORS.surface },
  settingsTitle: { fontSize: 17, fontWeight: '700', color: COLORS.gold },
  settingsValues: { fontSize: 15, color: COLORS.muted },
  body: { fontSize: 16, lineHeight: 24, maxWidth: 420, color: COLORS.text },
  bold: { fontWeight: '700', color: COLORS.gold },
  startButton: { paddingHorizontal: 56, paddingVertical: 20, borderRadius: 16, borderWidth: OUTLINE, borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  startLabel: { fontSize: 22, fontWeight: '700', color: COLORS.dark },
});
