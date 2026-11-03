import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

const BASE_COLOR = '#f3f4f6';
const FEEDBACK_COLOR = '#fdba74'; // soft orange: noticeable but not alarming

/**
 * Large match button. When `falseAlarmCount` increases it plays a short, neutral
 * colour pulse and shake (no red, no sound, no "Wrong!" text).
 */
export function MatchButton({ label, falseAlarmCount, onPress }: { label: string; falseAlarmCount: number; onPress: () => void }) {
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (falseAlarmCount === 0) return; // a reset to 0 at round start is not a wrong press
    pulse.setValue(0);
    Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  }, [falseAlarmCount, pulse]);

  const backgroundColor = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [BASE_COLOR, FEEDBACK_COLOR, BASE_COLOR] });
  const translateX = pulse.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -6, 6, -6, 0] });

  return (
    <Pressable style={styles.pressable} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label} match`}>
      <Animated.View style={[styles.button, { backgroundColor, transform: [{ translateX }] }]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  button: { minHeight: 88, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 20, fontWeight: '600' },
});
