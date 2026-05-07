import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import BarChart from '../components/BarChart';
import useStreak from '../hooks/useStreak';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

const QUICK_STATS = [
  { label: 'Steps', value: '6,240', unit: 'today', color: COLORS.primary, icon: '👟' },
  { label: 'Water', value: '1.4', unit: 'liters', color: '#4FC3F7', icon: '💧' },
  { label: 'Calories', value: '1,820', unit: 'kcal', color: COLORS.secondary, icon: '🔥' },
  { label: 'Sleep', value: '7.5', unit: 'hours', color: '#B39DDB', icon: '🌙' },
];

const RECENT_WORKOUTS = [
  { name: 'Morning Run', duration: '28 min', type: 'Cardio', date: 'Today', emoji: '🏃' },
  { name: 'Upper Body', duration: '45 min', type: 'Strength', date: 'Yesterday', emoji: '🏋️' },
  { name: 'Yoga Flow', duration: '30 min', type: 'Flexibility', date: 'Mon', emoji: '🧘' },
];

export default function HomeScreen() {
  const { streak, weeklyData, loading, reload } = useStreak();

  // Reload streak when screen comes into focus (after saving log)
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Build bar chart data - show workout days this week
  const chartData = weeklyData.length > 0
    ? weeklyData.map(d => ({ ...d, value: d.value * (3 + Math.floor(Math.random() * 3)) }))
    : Array(7).fill(0).map((_, i) => ({
        label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i],
        value: 0, today: false,
      }));

  // Use real streak or show 0
  const displayStreak = streak;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>Alex 👋</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{displayStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        {/* Goal Banner */}
        <View style={styles.goalBanner}>
          <View>
            <Text style={styles.goalTitle}>Today's goal</Text>
            <Text style={styles.goalSub}>Complete your upper body workout</Text>
          </View>
          <TouchableOpacity style={styles.goalBtn}>
            <Text style={styles.goalBtnText}>Start →</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Activity</Text>
            <View style={styles.cardBadge}>
              <Ionicons name="trending-up" size={12} color={COLORS.primary} />
              <Text style={styles.cardBadgeText}>This week</Text>
            </View>
          </View>
          <View style={{ marginTop: SPACING.md }}>
            <BarChart
              data={
                weeklyData.length > 0
                  ? weeklyData.map((d, i) => ({
                      label: d.label,
                      value: d.value > 0 ? 20 + i * 5 : 0,
                      today: d.today,
                    }))
                  : [
                      { label: 'Mon', value: 30, today: false },
                      { label: 'Tue', value: 45, today: false },
                      { label: 'Wed', value: 25, today: false },
                      { label: 'Thu', value: 60, today: false },
                      { label: 'Fri', value: 40, today: false },
                      { label: 'Sat', value: 55, today: false },
                      { label: 'Today', value: 35, today: true },
                    ]
              }
              height={100}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Today's stats</Text>
        <View style={styles.statsGrid}>
          {QUICK_STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statUnit}>{stat.unit}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Workouts */}
        <Text style={styles.sectionTitle}>Recent workouts</Text>
        {RECENT_WORKOUTS.map((workout) => (
          <TouchableOpacity key={workout.name} style={styles.workoutRow}>
            <View style={styles.workoutIcon}>
              <Text style={{ fontSize: 20 }}>{workout.emoji}</Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutMeta}>{workout.duration} · {workout.type}</Text>
            </View>
            <Text style={styles.workoutDate}>{workout.date}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg, marginTop: SPACING.sm },
  greeting: { fontSize: 15, color: COLORS.textSecondary },
  name: { fontSize: 28, color: COLORS.textPrimary, fontWeight: '700', marginTop: 2 },
  streakBadge: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  streakFire: { fontSize: 18 },
  streakCount: { fontSize: 20, color: COLORS.primary, fontWeight: '700' },
  streakLabel: { fontSize: 10, color: COLORS.textSecondary },

  goalBanner: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  goalTitle: { fontSize: 12, color: '#003D2B', fontWeight: '600', marginBottom: 4 },
  goalSub: { fontSize: 15, color: '#001A13', fontWeight: '600', maxWidth: 200 },
  goalBtn: { backgroundColor: '#001A13', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  goalBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  cardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  cardBadgeText: { fontSize: 11, color: COLORS.primary, fontWeight: '500' },

  sectionTitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, width: (width - SPACING.md * 2 - SPACING.sm) / 2, borderWidth: 1, borderColor: COLORS.border },
  statIcon: { fontSize: 18, marginBottom: SPACING.xs },
  statValue: { fontSize: 24, fontWeight: '700' },
  statUnit: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statLabel: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, fontWeight: '500' },

  workoutRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  workoutIcon: { width: 44, height: 44, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  workoutMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  workoutDate: { fontSize: 12, color: COLORS.textMuted },
});
