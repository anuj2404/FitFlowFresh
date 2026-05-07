import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BarChart from '../components/BarChart';
import useStreak from '../hooks/useStreak';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const GOALS = [
  { id: 'lose', label: 'Lose weight', emoji: '⚖️' },
  { id: 'muscle', label: 'Build muscle', emoji: '💪' },
  { id: 'endurance', label: 'Improve endurance', emoji: '🏃' },
  { id: 'flex', label: 'Stay flexible', emoji: '🧘' },
];

const SETTINGS = [
  { label: 'Daily reminder', key: 'reminder', icon: 'notifications-outline' },
  { label: 'Workout notifications', key: 'workoutNotif', icon: 'barbell-outline' },
  { label: 'Weekly summary', key: 'weeklySummary', icon: 'bar-chart-outline' },
];

export default function ProfileScreen() {
  const [activeGoal, setActiveGoal] = useState('muscle');
  const [toggles, setToggles] = useState({ reminder: true, workoutNotif: false, weeklySummary: true });
  const { streak, weeklyData, weeklyAverages, loading, reload } = useStreak();

  useFocusEffect(useCallback(() => { reload(); }, []));

  const toggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const daysLogged = weeklyData.filter(d => d.value > 0).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.name}>Alex Johnson</Text>
          <Text style={styles.joined}>Member since May 2025</Text>
        </View>

        {/* Stats Row - now using real data */}
        <View style={styles.statsRow}>
          {[
            { label: 'Streak', value: `${streak}d`, color: COLORS.primary },
            { label: 'This week', value: `${daysLogged}/7`, color: COLORS.warning },
            { label: 'Workouts', value: '48', color: '#4FC3F7' },
          ].map((s, i) => (
            <View key={s.label} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: COLORS.border }]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Habit Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Weekly Habit Log</Text>
          <View style={{ marginTop: SPACING.md }}>
            <BarChart
              data={
                weeklyData.length > 0
                  ? weeklyData.map(d => ({ label: d.label, value: d.water, today: d.today }))
                  : Array(7).fill(0).map((_, i) => ({ label: ['S','M','T','W','T','F','S'][i], value: 0, today: i === 6 }))
              }
              height={80}
              color="#4FC3F7"
            />
          </View>
          <Text style={styles.chartLabel}>💧 Water intake (glasses/day)</Text>
        </View>

        {/* Weekly Averages */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Weekly Averages</Text>
          <View style={styles.avgGrid}>
            {[
              { label: 'Water', value: `${weeklyAverages.water || 0}`, unit: 'glasses', color: '#4FC3F7', icon: '💧' },
              { label: 'Steps', value: `${(weeklyAverages.steps || 0).toLocaleString()}`, unit: 'steps', color: COLORS.primary, icon: '👟' },
              { label: 'Sleep', value: `${weeklyAverages.sleep || 0}h`, unit: 'avg', color: '#B39DDB', icon: '🌙' },
            ].map((avg) => (
              <View key={avg.label} style={styles.avgCard}>
                <Text style={styles.avgIcon}>{avg.icon}</Text>
                <Text style={[styles.avgValue, { color: avg.color }]}>{avg.value}</Text>
                <Text style={styles.avgUnit}>{avg.unit}</Text>
                <Text style={styles.avgLabel}>{avg.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goals */}
        <Text style={styles.sectionTitle}>My goal</Text>
        <View style={styles.goalsGrid}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalChip, activeGoal === g.id && styles.goalChipActive]}
              onPress={() => setActiveGoal(g.id)}
            >
              <Text style={styles.goalEmoji}>{g.emoji}</Text>
              <Text style={[styles.goalLabel, activeGoal === g.id && styles.goalLabelActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsCard}>
          {SETTINGS.map((s, i) => (
            <View key={s.key} style={[styles.settingRow, i < SETTINGS.length - 1 && styles.settingBorder]}>
              <View style={styles.settingLeft}>
                <Ionicons name={s.icon} size={18} color={COLORS.textSecondary} />
                <Text style={styles.settingLabel}>{s.label}</Text>
              </View>
              <Switch
                value={toggles[s.key]}
                onValueChange={() => toggle(s.key)}
                trackColor={{ false: COLORS.bgInput, true: COLORS.primary }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  avatarSection: { alignItems: 'center', marginVertical: SPACING.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  avatarText: { fontSize: 32, color: '#001A13', fontWeight: '700' },
  name: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700' },
  joined: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  chartLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.sm, textAlign: 'center' },

  avgGrid: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  avgCard: { flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, padding: SPACING.sm, alignItems: 'center' },
  avgIcon: { fontSize: 18, marginBottom: 4 },
  avgValue: { fontSize: 18, fontWeight: '700' },
  avgUnit: { fontSize: 11, color: COLORS.textSecondary },
  avgLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  sectionTitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.sm },

  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  goalChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  goalChipActive: { borderColor: COLORS.primary },
  goalEmoji: { fontSize: 16 },
  goalLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  goalLabelActive: { color: COLORS.primary },

  settingsCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  settingLabel: { fontSize: 15, color: COLORS.textPrimary },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.danger, borderRadius: RADIUS.full, padding: SPACING.md },
  signOutText: { fontSize: 15, color: COLORS.danger, fontWeight: '600' },
});
