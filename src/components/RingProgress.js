import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

// Pure React Native circular progress using border trick
export default function RingProgress({ value, max, size = 80, color = COLORS.primary, label, sublabel }) {
  const pct = Math.min(value / max, 1);
  const displayPct = Math.round(pct * 100);

  // We simulate a ring using two half-circle views
  const borderWidth = size * 0.1;
  const halfSize = size / 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth,
            borderColor: COLORS.bgInput,
          },
        ]}
      />
      {/* Progress overlay using solid arc simulation */}
      <View style={styles.center}>
        <Text style={[styles.pct, { fontSize: size * 0.22, color }]}>
          {displayPct}%
        </Text>
        {label && (
          <Text style={[styles.label, { fontSize: size * 0.13 }]}>{label}</Text>
        )}
        {sublabel && (
          <Text style={[styles.sublabel, { fontSize: size * 0.11 }]}>{sublabel}</Text>
        )}
      </View>

      {/* Filled arc segments using positioned views */}
      {pct > 0 && (
        <View
          style={[
            styles.arcFill,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth,
              borderColor: color,
              borderTopColor: pct > 0.25 ? color : 'transparent',
              borderRightColor: pct > 0.5 ? color : 'transparent',
              borderBottomColor: pct > 0.75 ? color : 'transparent',
              borderLeftColor: pct > 0.99 ? color : 'transparent',
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  arcFill: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: { fontWeight: '700' },
  label: { color: COLORS.textSecondary, marginTop: 1 },
  sublabel: { color: COLORS.textMuted },
});
