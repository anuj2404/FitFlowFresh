import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BarChart from '../components/BarChart';
import useStreak from '../hooks/useStreak';
import useProfile from '../hooks/useProfile';
import useWorkoutLogs from '../hooks/useWorkoutLogs';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const GOALS = [
  { id: 'lose',      label: 'Lose weight',       emoji: '⚖️' },
  { id: 'muscle',    label: 'Build muscle',       emoji: '💪' },
  { id: 'endurance', label: 'Improve endurance',  emoji: '🏃' },
  { id: 'flex',      label: 'Stay flexible',      emoji: '🧘' },
];

const SETTINGS = [
  { label: 'Daily reminder',       key: 'reminder',      icon: 'notifications-outline' },
  { label: 'Workout notifications', key: 'workoutNotif',  icon: 'barbell-outline' },
  { label: 'Weekly summary',        key: 'weeklySummary', icon: 'bar-chart-outline' },
];

const LEVEL_LABELS = {
  beginner:     { label: 'Beginner',     color: COLORS.primary },
  intermediate: { label: 'Intermediate', color: COLORS.warning },
  advanced:     { label: 'Advanced',     color: COLORS.danger },
};

const CHART_METRICS = [
  { key: 'water', label: '💧 Water',  color: '#4FC3F7', unit: 'glasses/day' },
  { key: 'steps', label: '👟 Steps',  color: COLORS.primary, unit: 'steps/day' },
  { key: 'sleep', label: '🌙 Sleep',  color: '#B39DDB', unit: 'hours/day' },
];

// Fitness score: streak (40%) + workout consistency (30%) + habit avg (30%)
const calcFitnessScore = (streak, totalWorkouts, weeklyAverages) => {
  const streakScore  = Math.min(40, streak * 2);
  const workoutScore = Math.min(30, totalWorkouts * 2);
  const habitScore   = Math.min(30, Math.round(
    (Math.min(1, (weeklyAverages.water || 0) / 8) +
     Math.min(1, (weeklyAverages.steps || 0) / 8000) +
     Math.min(1, (weeklyAverages.sleep || 0) / 8)) / 3 * 30
  ));
  return streakScore + workoutScore + habitScore;
};

const scoreLabel = (score) => {
  if (score >= 80) return { label: 'Elite 🏆',      color: COLORS.danger };
  if (score >= 60) return { label: 'Advanced ⚡',   color: COLORS.warning };
  if (score >= 40) return { label: 'Consistent 💪', color: COLORS.primary };
  if (score >= 20) return { label: 'Building 🌱',   color: '#4FC3F7' };
  return               { label: 'Getting started', color: COLORS.textSecondary };
};

export default function ProfileScreen() {
  const { streak, weeklyData, weeklyAverages, reload } = useStreak();
  const { profile, updateProfile } = useProfile();
  const { totalCount, reload: reloadLogs } = useWorkoutLogs();
  const { signOut } = useAuth();
  const [chartMetricIdx, setChartMetricIdx] = useState(0);

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { Alert.alert('Error', e.message); }
  };

  useFocusEffect(useCallback(() => { reload(); reloadLogs(); }, []));

  const activeGoal  = profile?.goal || null;
  const toggles     = profile?.notifications || { reminder: true, workoutNotif: false, weeklySummary: true };
  const levelInfo   = LEVEL_LABELS[profile?.level];
  const chartMetric = CHART_METRICS[chartMetricIdx];

  const toggle = async (key) => {
    const updated = { ...toggles, [key]: !toggles[key] };
    await updateProfile({ notifications: updated });
  };

  const daysLogged  = weeklyData.filter(d => d.value > 0).length;
  const joinedDate  = profile?.joined_at
    ? new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const fitnessScore = calcFitnessScore(streak, totalCount, weeklyAverages);
  const { label: scoreTag, color: scoreColor } = scoreLabel(fitnessScore);

  const chartData = weeklyData.length > 0
    ? weeklyData.map(d => ({ label: d.label, value: d[chartMetric.key] || 0, today: d.today }))
    : Array(7).fill(0).map((_, i) => ({ label: ['S','M','T','W','T','F','S'][i], value: 0, today: i === 6 }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: streak >= 7 ? COLORS.warning : COLORS.primary }]}>
            <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile?.name || 'Athlete'}</Text>
            {levelInfo && (
              <View style={[styles.levelBadge, { borderColor: levelInfo.color }]}>
                <Text style={[styles.levelBadgeText, { color: levelInfo.color }]}>{levelInfo.label}</Text>
              </View>
            )}
          </View>
          {joinedDate && <Text style={styles.joined}>Member since {joinedDate}</Text>}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Streak',    value: `${streak}d`,      color: streak >= 7 ? COLORS.warning : COLORS.primary },
            { label: 'This week', value: `${daysLogged}/7`, color: COLORS.warning },
            { label: 'Workouts',  value: `${totalCount}`,   color: '#4FC3F7' },
          ].map((s, i) => (
            <View key={s.label} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: COLORS.border }]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Fitness Score */}
        <View style={styles.card}>
          <View style={styles.scoreHeader}>
            <Text style={styles.cardTitle}>🎯 Fitness Score</Text>
            <Text style={[styles.scoreTag, { color: scoreColor }]}>{scoreTag}</Text>
          </View>
          <View style={styles.scoreTrack}>
            <View style={[styles.scoreFill, { width: `${fitnessScore}%`, backgroundColor: scoreColor }]} />
          </View>
          <Text style={styles.scoreValue}>{fitnessScore} / 100</Text>
        </View>

        {/* Weekly Habit Chart — toggleable */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>📊 Weekly Habits</Text>
            <View style={styles.metricToggle}>
              {CHART_METRICS.map((m, i) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.metricChip, chartMetricIdx === i && { backgroundColor: m.color }]}
                  onPress={() => setChartMetricIdx(i)}
                >
                  <Text style={[styles.metricChipText, chartMetricIdx === i && { color: '#001A13' }]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ marginTop: SPACING.md }}>
            <BarChart data={chartData} height={80} color={chartMetric.color} />
          </View>
          <Text style={styles.chartLabel}>{chartMetric.unit}</Text>
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
              onPress={() => updateProfile({ goal: g.id })}
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

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
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
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  avatarText: { fontSize: 32, color: '#001A13', fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  name: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700' },
  levelBadge: { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  levelBadgeText: { fontSize: 11, fontWeight: '600' },
  joined: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },

  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  scoreTag: { fontSize: 13, fontWeight: '700' },
  scoreTrack: { height: 6, backgroundColor: COLORS.bgInput, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  scoreFill: { height: 6, borderRadius: 3 },
  scoreValue: { fontSize: 12, color: COLORS.textSecondary },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricToggle: { flexDirection: 'row', gap: 4 },
  metricChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: RADIUS.full, backgroundColor: COLORS.bgInput },
  metricChipText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
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
