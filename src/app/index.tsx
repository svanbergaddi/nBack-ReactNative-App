import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { computeMaxScore } from '../domain/engine';
import { DEFAULT_SETTINGS } from '../domain/types';

/** Home screen (placeholder until the full Home in step C): explains the game and opens it. */
export default function HomeScreen() {
  const { n } = DEFAULT_SETTINGS;
  const maxScore = computeMaxScore(DEFAULT_SETTINGS);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dual {n}-back</Text>
      <Text style={styles.body}>
        Each step, a square lights up in the grid and a letter is spoken.{'\n\n'}
        Tap <Text style={styles.bold}>Position</Text> when the square is in the same place as {n} steps ago.{'\n'}
        Tap <Text style={styles.bold}>Sound</Text> when the letter is the same as {n} steps ago.{'\n\n'}
        Your score is correct taps minus wrong taps. A perfect round scores {maxScore}.
      </Text>
      <Link href="/game" asChild>
        <Pressable style={styles.playButton} accessibilityRole="button">
          <Text style={styles.playLabel}>Play</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 24, maxWidth: 420 },
  bold: { fontWeight: '700' },
  playButton: { paddingHorizontal: 48, paddingVertical: 20, borderRadius: 16, backgroundColor: '#3b82f6' },
  playLabel: { fontSize: 22, fontWeight: '600', color: 'white' },
});
