import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const EXERCISES_MAP = {
  'Full Body Blast': [
    { name: 'Barbell Squat', sets: 4, reps: '8-10', rest: 90 },
    { name: 'Bench Press', sets: 4, reps: '8-10', rest: 90 },
    { name: 'Deadlift', sets: 3, reps: '6-8', rest: 120 },
    { name: 'Pull-ups', sets: 3, reps: '8-12', rest: 60 },
    { name: 'Overhead Press', sets: 3, reps: '10-12', rest: 60 },
    { name: 'Dumbbell Row', sets: 3, reps: '10-12', rest: 60 },
    { name: 'Plank', sets: 3, reps: '45 sec', rest: 30 },
    { name: 'Face Pulls', sets: 3, reps: '15-20', rest: 30 },
  ],
  '5K Runner Prep': [
    { name: 'Dynamic Warmup', sets: 1, reps: '5 min', rest: 0 },
    { name: 'Easy Jog', sets: 1, reps: '10 min', rest: 0 },
    { name: 'Tempo Intervals', sets: 4, reps: '400m', rest: 90 },
    { name: 'Hill Repeats', sets: 3, reps: '200m', rest: 60 },
    { name: 'Cool Down Walk', sets: 1, reps: '5 min', rest: 0 },
  ],
  'Morning Yoga': [
    { name: "Child's Pose", sets: 1, reps: '60 sec', rest: 0 },
    { name: 'Cat-Cow Stretch', sets: 1, reps: '10 reps', rest: 0 },
    { name: 'Sun Salutation', sets: 3, reps: '5 reps', rest: 0 },
    { name: 'Warrior I', sets: 1, reps: '45 sec each', rest: 0 },
    { name: 'Warrior II', sets: 1, reps: '45 sec each', rest: 0 },
    { name: 'Triangle Pose', sets: 1, reps: '30 sec each', rest: 0 },
    { name: 'Seated Forward Fold', sets: 1, reps: '60 sec', rest: 0 },
    { name: 'Savasana', sets: 1, reps: '3 min', rest: 0 },
  ],
  'Tabata Burn': [
    { name: 'Jump Squats', sets: 8, reps: '20s on / 10s off', rest: 0 },
    { name: 'Burpees', sets: 8, reps: '20s on / 10s off', rest: 0 },
    { name: 'Mountain Climbers', sets: 8, reps: '20s on / 10s off', rest: 0 },
    { name: 'Push-up Jacks', sets: 8, reps: '20s on / 10s off', rest: 0 },
    { name: 'High Knees', sets: 8, reps: '20s on / 10s off', rest: 0 },
    { name: 'Jump Lunges', sets: 8, reps: '20s on / 10s off', rest: 0 },
  ],
  'Upper Body Push': [
    { name: 'Incline Bench Press', sets: 4, reps: '8-10', rest: 90 },
    { name: 'Flat Dumbbell Press', sets: 3, reps: '10-12', rest: 60 },
    { name: 'Overhead Press', sets: 4, reps: '8-10', rest: 90 },
    { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: 45 },
    { name: 'Tricep Dips', sets: 3, reps: '10-15', rest: 60 },
    { name: 'Cable Pushdown', sets: 3, reps: '12-15', rest: 45 },
    { name: 'Front Raises', sets: 3, reps: '12-15', rest: 45 },
  ],
  'Core & Abs': [
    { name: 'Plank', sets: 3, reps: '60 sec', rest: 30 },
    { name: 'Crunches', sets: 3, reps: '20 reps', rest: 30 },
    { name: 'Leg Raises', sets: 3, reps: '15 reps', rest: 30 },
    { name: 'Russian Twists', sets: 3, reps: '20 reps', rest: 30 },
    { name: 'Dead Bug', sets: 3, reps: '10 each side', rest: 30 },
    { name: 'Ab Wheel Rollout', sets: 3, reps: '10 reps', rest: 45 },
    { name: 'Side Plank', sets: 3, reps: '30 sec each', rest: 30 },
    { name: 'Bicycle Crunches', sets: 3, reps: '20 reps', rest: 30 },
    { name: 'Mountain Climbers', sets: 3, reps: '30 sec', rest: 30 },
  ],
};

// Rest Timer Component
function RestTimer({ seconds, onDone }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 0) { onDone(); return; }
    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const pct = timeLeft / seconds;
  const color = pct > 0.5 ? COLORS.primary : pct > 0.25 ? COLORS.warning : COLORS.danger;

  return (
    <View style={timerStyles.overlay}>
      <View style={timerStyles.card}>
        <Text style={timerStyles.title}>Rest Timer</Text>
        <Animated.Text style={[timerStyles.time, { color, transform: [{ scale: scaleAnim }] }]}>
          {timeLeft}s
        </Animated.Text>
        <Text style={timerStyles.subtitle}>Get ready for the next set</Text>
        <TouchableOpacity style={timerStyles.skipBtn} onPress={onDone}>
          <Text style={timerStyles.skipText}>Skip Rest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', width: 260, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  time: { fontSize: 72, fontWeight: '700', marginVertical: SPACING.md },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  skipBtn: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  skipText: { color: COLORS.textSecondary, fontWeight: '600' },
});

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workout } = route.params;
  const exercises = EXERCISES_MAP[workout.name] || [];
  const [completed, setCompleted] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Celebration animation
  const celebAnim = useRef(new Animated.Value(0)).current;

  const completedCount = Object.values(completed).filter(Boolean).length;
  const allDone = completedCount === exercises.length && exercises.length > 0;

  const toggleExercise = (index) => {
    const wasCompleted = completed[index];
    setCompleted((prev) => ({ ...prev, [index]: !prev[index] }));

    // Start rest timer when completing an exercise (if it has rest time)
    if (!wasCompleted && exercises[index].rest > 0) {
      setTimerSeconds(exercises[index].rest);
      setShowTimer(true);
    }
  };

  // Celebration bounce when all done
  useEffect(() => {
    if (allDone) {
      Animated.spring(celebAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  }, [allDone]);

  const handleFinish = () => {
    Alert.alert(
      'Workout Complete! 🎉',
      `Amazing work! You finished ${workout.name} with ${exercises.length} exercises.`,
      [{ text: 'Back to Workouts', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Rest Timer Overlay */}
      {showTimer && (
        <RestTimer seconds={timerSeconds} onDone={() => setShowTimer(false)} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{workout.name}</Text>
          <Text style={styles.subtitle}>{workout.duration} · {workout.category}</Text>
        </View>
        <Text style={styles.headerEmoji}>{workout.emoji}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{completedCount} / {exercises.length} exercises</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: `${(completedCount / exercises.length) * 100}%` }]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {exercises.map((ex, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.exerciseCard, completed[i] && styles.exerciseCardDone]}
            onPress={() => toggleExercise(i)}
          >
            <View style={[styles.checkbox, completed[i] && styles.checkboxDone]}>
              {completed[i] && <Ionicons name="checkmark" size={16} color="#001A13" />}
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, completed[i] && styles.exerciseNameDone]}>
                {ex.name}
              </Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets} sets · {ex.reps}
                {ex.rest > 0 ? ` · ${ex.rest}s rest` : ''}
              </Text>
            </View>
            {ex.rest > 0 && (
              <TouchableOpacity
                style={styles.timerBtn}
                onPress={() => { setTimerSeconds(ex.rest); setShowTimer(true); }}
              >
                <Ionicons name="timer-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        {/* Finish Button */}
        <Animated.View style={allDone ? {
          transform: [{ scale: celebAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }]
        } : {}}>
          <TouchableOpacity
            style={[styles.finishBtn, !allDone && styles.finishBtnDisabled]}
            onPress={allDone ? handleFinish : null}
          >
            <Ionicons
              name={allDone ? "trophy" : "lock-closed-outline"}
              size={18}
              color={allDone ? '#001A13' : COLORS.textMuted}
            />
            <Text style={[styles.finishBtnText, !allDone && styles.finishBtnTextDisabled]}>
              {allDone ? 'Finish Workout 🎉' : `${exercises.length - completedCount} exercises remaining`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.sm },
  headerInfo: { flex: 1 },
  title: { fontSize: 18, color: COLORS.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  headerEmoji: { fontSize: 32 },
  progressRow: { padding: SPACING.md, paddingBottom: SPACING.sm },
  progressText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  progressTrack: { height: 6, backgroundColor: COLORS.bgInput, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xxl },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  exerciseCardDone: { borderColor: COLORS.primary, opacity: 0.7 },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  exerciseNameDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  exerciseMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  timerBtn: { width: 36, height: 36, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  finishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, marginTop: SPACING.md },
  finishBtnDisabled: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  finishBtnText: { fontSize: 16, color: '#001A13', fontWeight: '700' },
  finishBtnTextDisabled: { color: COLORS.textMuted },
});
