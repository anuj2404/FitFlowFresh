import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

export default function AnimatedRing({ value, max, size = 90, color = COLORS.primary, label, unit }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const pct = Math.min(value / max, 1);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: pct,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const borderWidth = size * 0.1;

  // Animate border colors based on progress
  const topColor = animValue.interpolate({
    inputRange: [0, 0.001, 1],
    outputRange: [COLORS.bgInput, color, color],
  });
  const rightColor = animValue.interpolate({
    inputRange: [0, 0.25, 0.251, 1],
    outputRange: [COLORS.bgInput, COLORS.bgInput, color, color],
  });
  const bottomColor = animValue.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [COLORS.bgInput, COLORS.bgInput, color, color],
  });
  const leftColor = animValue.interpolate({
    inputRange: [0, 0.75, 0.751, 1],
    outputRange: [COLORS.bgInput, COLORS.bgInput, color, color],
  });

  const displayValue = value > 0 ? value : 0;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Background track */}
      <View style={[styles.track, { width: size, height: size, borderRadius: size / 2, borderWidth, borderColor: COLORS.bgInput }]} />

      {/* Animated arc */}
      <Animated.View
        style={[
          styles.arc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderTopColor: topColor,
            borderRightColor: rightColor,
            borderBottomColor: bottomColor,
            borderLeftColor: leftColor,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />

      {/* Center text */}
      <View style={styles.center}>
        <Text style={[styles.value, { fontSize: size * 0.22, color }]}>
          {displayValue}
        </Text>
        <Text style={[styles.unit, { fontSize: size * 0.13 }]}>{unit}</Text>
        <Text style={[styles.label, { fontSize: size * 0.12 }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  track: { position: 'absolute' },
  arc: { position: 'absolute' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '700' },
  unit: { color: COLORS.textSecondary, marginTop: 1 },
  label: { color: COLORS.textMuted, marginTop: 1 },
});
