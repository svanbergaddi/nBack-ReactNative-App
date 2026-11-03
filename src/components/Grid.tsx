// VIEW · Square n×n grid with one lit cell.

import { useEffect, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

import { COLORS, OUTLINE } from './theme';

const GAP = 6;

/**
 * Square gridSize × gridSize board with one lit cell. The side is the smaller of the
 * available width and height, so the grid stays square in portrait and landscape.
 */
export function Grid({ gridSize, litCell, eventIndex }: { gridSize: number; litCell: number | null; eventIndex: number }) {
  const { width, height } = useWindowDimensions();
  const side = Math.min(width - 32, height * 0.5);
  const cellSize = (side - GAP * (gridSize - 1)) / gridSize;

  // Fade the lit cell in on every new event, so a repeated cell is still visible as a new stimulus.
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [eventIndex, opacity]);

  return (
    <View style={[styles.grid, { width: side, height: side, gap: GAP }]}>
      {Array.from({ length: gridSize * gridSize }, (_, cell) => (
        <View key={cell} style={[styles.cell, { width: cellSize, height: cellSize }]}>
          {cell === litCell && <Animated.View style={[styles.lit, { opacity }]} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { borderRadius: 8, borderWidth: OUTLINE, borderColor: COLORS.gold, backgroundColor: COLORS.purple, overflow: 'hidden' },
  lit: { flex: 1, backgroundColor: COLORS.gold },
});
