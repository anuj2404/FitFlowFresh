import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function BarChart({ data, height = 120, color = COLORS.primary }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.wrapper}>
      {/* Bars */}
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, i) => {
          const barHeight = (item.value / max) * height;
          const isEmpty = item.value === 0;
          return (
            <View key={i} style={styles.barColumn}>
              <View style={[styles.barTrack, { height }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, isEmpty ? 4 : 6),
                      backgroundColor: isEmpty ? COLORS.bgInput : color,
                      opacity: item.today ? 1 : 0.6,
                    },
                  ]}
                />
              </View>
              {item.value > 0 && (
                <Text style={styles.barValue}>{item.value}</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* X Labels */}
      <View style={styles.labels}>
        {data.map((item, i) => (
          <Text
            key={i}
            style={[styles.label, item.today && styles.labelToday]}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  barColumn: { flex: 1, alignItems: 'center' },
  barTrack: { width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '80%', borderRadius: RADIUS.sm },
  barValue: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  labelToday: { color: COLORS.primary, fontWeight: '700' },
});
