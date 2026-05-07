import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function StatCard({ label, value, unit, color, icon }) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 140,
  },
  icon: { fontSize: 20, marginBottom: SPACING.xs },
  value: { fontSize: 24, fontWeight: '700' },
  unit: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  label: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, fontWeight: '500' },
});
