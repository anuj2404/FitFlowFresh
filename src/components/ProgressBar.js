import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ProgressBar({ value, max, color = COLORS.primary, height = 6 }) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct * 100}%`, backgroundColor: color, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  fill: { borderRadius: 999 },
});
