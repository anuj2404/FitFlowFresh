import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useEffect } from 'react';
import useHabits from '../hooks/useHabits';
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

export default function LogScreen() {
  const { habits, loading, updateHabit, saveHabits } = useHabits();

  // Fade-in animation on load
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

        {/* Animated Rings Summary */}
        <View style={styles.ringsCard}>
          <Text style={styles.cardTitle}>Today's Progress</Text>
          <View style={styles.ringsRow}>
            <AnimatedRing value={habits.water} max={8} size={90} color="#4FC3F7" label="Water" unit="glasses" />
            <AnimatedRing value={Math.round(habits.steps / 100)} max={100} size={90} color={COLORS.primary} label="Steps" unit={`${habits.steps.toLocaleString()}`} />
            <AnimatedRing value={habits.sleep} max={8} size={90} color="#B39DDB" label="Sleep" unit="hrs" />
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
            <Text style={styles.cardValue}>{habits.water} <Text style={styles.cardUnit}>/ 8 glasses</Text></Text>
          </View>
          <ProgressBar value={habits.water} max={8} color="#4FC3F7" />
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('water', Math.max(0, habits.water - 1))}>
              <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{habits.water} glasses</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHabit('water', Math.min(12, habits.water + 1))}>
              <Ionicons name="add" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👟 Steps</Text>
            <Text style={styles.cardValue}>{habits.steps.toLocaleString()} <Text style={styles.cardUnit}>/ 10,000</Text></Text>
          </View>
          <ProgressBar value={habits.steps} max={10000} color={COLORS.primary} />
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
            <Text style={styles.cardValue}>{habits.sleep}h <Text style={styles.cardUnit}>/ 8h goal</Text></Text>
          </View>
          <ProgressBar value={habits.sleep} max={8} color="#B39DDB" />
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
  ringsCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600', marginBottom: SPACING.sm },
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
