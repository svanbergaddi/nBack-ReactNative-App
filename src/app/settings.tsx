// VIEW · Settings screen: − / + rows for n, event duration, events per round, grid size, letters.

import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, OUTLINE } from '../components/theme';
import { NumericSetting, SETTING_RANGES } from '../domain/types';
import { useSettings } from '../viewmodels/useSettings';

/** Label and display format per setting; ranges come from the domain. */
const ROWS: { key: NumericSetting; label: string; format: (value: number) => string }[] = [
  { key: 'n', label: 'n (steps back)', format: String },
  { key: 'eventDurationMs', label: 'Event duration', format: (ms) => `${ms / 1000} s` },
  { key: 'eventsPerRound', label: 'Events per round', format: String },
  { key: 'gridSize', label: 'Grid size', format: (size) => `${size}×${size}` },
  { key: 'letterCount', label: 'Spoken letters', format: String },
];

/** Settings screen. Every change is saved at once and applies from the next round. */
export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />
      {ROWS.map(({ key, label, format }) => {
        const { min, max, step } = SETTING_RANGES[key];
        const value = settings[key];
        const stepButton = (symbol: string, delta: number, isEnabled: boolean) => (
          <Pressable
            style={[styles.stepButton, !isEnabled && styles.disabled]}
            disabled={!isEnabled}
            onPress={() => updateSettings({ [key]: value + delta })}
            accessibilityRole="button"
            accessibilityLabel={`${delta > 0 ? 'Increase' : 'Decrease'} ${label}`}
          >
            <Text style={styles.stepLabel}>{symbol}</Text>
          </Pressable>
        );
        return (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            {stepButton('−', -step, value > min)}
            <Text style={styles.value}>{format(value)}</Text>
            {stepButton('+', step, value < max)}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { flex: 1, fontSize: 17, color: COLORS.text },
  value: { minWidth: 56, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.gold, fontVariant: ['tabular-nums'] },
  stepButton: { width: 48, height: 48, borderRadius: 12, borderWidth: OUTLINE, borderColor: COLORS.gold, backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 24, fontWeight: '700', color: COLORS.gold },
  disabled: { opacity: 0.3 },
});
