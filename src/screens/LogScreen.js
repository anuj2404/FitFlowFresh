import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useEffect } from 'react';
import useHabits from '../hooks/useHabits';
import useProfile from '../hooks/useProfile';
import AnimatedRing from '../components/AnimatedRing';
import ProgressBar from '../components/ProgressBar';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
});

const MOODS = [
  { emoji: '😴', label: 'Tired' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😊', label: 'Good' },
  { emoji: '🔥', label: 'Pumped' },
];

// Per-goal targets
const GOAL_TARGETS = {
  lose:      { steps: 8000,  water: 8, sleep: 7 },
  muscle:    { steps: 6000,  water: 6, sleep: 8 },
  endurance: { steps: 10000, water: 8, sleep: 7 },
  flex:      { steps: 5000,  water: 6, sleep: 8 },
  default:   { steps: 8000,  water: 8, sleep: 8 },
};

const getMoodMessage = (mood, progress) => {
  if (!mood) return null;
  const pct = Math.round(progress * 100);
  if (mood === 'Pumped') return pct >= 80 ? "You're on fire today! 🔥 Keep crushing it." : "Great energy! Channel it into your goals 💪";
  if (mood === 'Good')   return pct >= 50 ? "Solid progress! Stay consistent 🎯" : "Good vibes — now let's back it up with action!";
  if (mood === 'Okay')   return "Every rep counts, even on average days 🙌";
  if (mood === 'Tired')  return pct >= 50 ? "Tired but still showing up — that's discipline 💯" : "Rest is part of the plan. Log what you can 🌙";
  return null;
};

export default function LogScreen() {
  const { habits, loading, updateHabit, saveHabits } = useHabits();
  const { profile } = useProfile();

  const targets = GOAL_TARGETS[profile?.goal] || GOAL_TARGETS.default;

  // Overall progress across all three metrics
  const overallProgress = (
    Math.min(1, (habits.water || 0) / targets.water) +
    Math.min(1, (habits.steps || 0) / targets.steps) +
    Math.min(1, (habits.sleep || 0) / targets.sleep)
  ) / 3;

  const moodMessage = getMoodMessage(habits.mood, overallProgress);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = async () => {
    const success = await saveHabits(habits);
    if (success) {
      Alert.alert('Saved! ✅', "Today's habits logged. Keep it up! 🔥");
    } else {
      Alert.alert('Error', 'Could not save. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Daily Log</Text>
            <Text style={styles.date}>{TODAY}</Text>
          </View>
          {habits.saved && (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          )}
        </View>

        {/* Mood message */}
        {moodMessage && (
          <View style={styles.moodMessage}>
            <Text style={styles.moodMessageText}>{moodMessage}</Text>
          </View>
        )}

        {/* Animated Rings Summary */}
        <View style={styles.ringsCard}>
          <View style={styles.ringsCardHeader}>
            <Text style={styles.cardTitle}>Today's Progress</Text>
            <Text style={styles.progressPct}>{Math.round(overallProgress * 100)}%</Text>
          </View>
          <View style={styles.ringsRow}>
            <AnimatedRing value={habits.water} max={targets.water} size={90} color="#4FC3F7" label="Water" unit="glasses" />
            <AnimatedRing value={Math.round(habits.steps / 100)} max={Math.round(targets.steps / 100)} size={90} color={COLORS.primary} label="Steps" unit={`${habits.steps.toLocaleString()}`} />
            <AnimatedRing value={habits.sleep} max={targets.sleep} size={90} color="#B39DDB" label="Sleep" unit="hrs" />
          </View>
        </View>

        {/* Mood */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.moodBtn, habits.mood === m.label && styles.moodBtnActive]}
                onPress={() => updateHabit('mood', m.label)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Water */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💧 Water</Text>
            <Text style={styles.cardValue}>
              {habits.water} <Text style={styles.cardUnit}>/ {targets.water} glasses</Text>
            </Text>
          </View>
          <ProgressBar value={habits.water} max={targets.water} color="#4FC3F7" />
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('water', Math.max(0, habits.water - 1))}>
              <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{habits.water} glasses</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('water', Math.min(16, habits.water + 1))}>
              <Ionicons name="add" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👟 Steps</Text>
            <Text style={styles.cardValue}>
              {habits.steps.toLocaleString()} <Text style={styles.cardUnit}>/ {targets.steps.toLocaleString()}</Text>
            </Text>
          </View>
          <ProgressBar value={habits.steps} max={targets.steps} color={COLORS.primary} />
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('steps', Math.max(0, habits.steps - 500))}>
              <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>+500 steps</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('steps', habits.steps + 500)}>
              <Ionicons name="add" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sleep */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🌙 Sleep</Text>
            <Text style={styles.cardValue}>
              {habits.sleep}h <Text style={styles.cardUnit}>/ {targets.sleep}h goal</Text>
            </Text>
          </View>
          <ProgressBar value={habits.sleep} max={targets.sleep} color="#B39DDB" />
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('sleep', Math.max(0, parseFloat((habits.sleep - 0.5).toFixed(1))))}>
              <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{habits.sleep} hours</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('sleep', parseFloat((habits.sleep + 0.5).toFixed(1)))}>
              <Ionicons name="add" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#001A13" />
          <Text style={styles.saveBtnText}>Save Today's Log</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg, marginTop: SPACING.sm },
  title: { fontSize: 28, color: COLORS.textPrimary, fontWeight: '700' },
  date: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.primary },
  savedText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  moodMessage: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  moodMessageText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  ringsCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  ringsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  progressPct: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.sm },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '700' },
  cardUnit: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '400' },

  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, gap: SPACING.sm },
  moodBtn: { flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, padding: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  moodBtnActive: { borderColor: COLORS.primary },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },

  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md },
  stepBtn: { width: 40, height: 40, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 14, color: COLORS.textSecondary },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, marginTop: SPACING.sm },
  saveBtnText: { fontSize: 16, color: '#001A13', fontWeight: '700' },
});
