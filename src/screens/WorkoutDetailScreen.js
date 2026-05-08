import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useExercises } from '../hooks/useWorkouts';
import useWorkoutLogs from '../hooks/useWorkoutLogs';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

function RestTimer({ seconds, onDone }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 0) { onDone(); return; }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
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
  const { exercises, loading } = useExercises(workout.id);
  const { logWorkout } = useWorkoutLogs();
  const [completed, setCompleted] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const celebAnim = useRef(new Animated.Value(0)).current;

  const completedCount = Object.values(completed).filter(Boolean).length;
  const allDone = exercises.length > 0 && completedCount === exercises.length;

  const toggleExercise = (index) => {
    const wasCompleted = completed[index];
    setCompleted((prev) => ({ ...prev, [index]: !prev[index] }));
    if (!wasCompleted && exercises[index].rest_seconds > 0) {
      setTimerSeconds(exercises[index].rest_seconds);
      setShowTimer(true);
    }
  };

  useEffect(() => {
    if (allDone) {
      Animated.spring(celebAnim, { toValue: 1, tension: 50, friction: 3, useNativeDriver: true }).start();
    }
  }, [allDone]);

  const handleTimerDone = useCallback(() => setShowTimer(false), []);
  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleFinish = async () => {
    await logWorkout(workout.id, completedCount);
    Alert.alert(
      'Workout Complete! 🎉',
      `Amazing work! You finished ${workout.name} with ${exercises.length} exercises.`,
      [{ text: 'Back to Workouts', onPress: () => navigation.goBack() }]
    );
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
      {showTimer && <RestTimer seconds={timerSeconds} onDone={handleTimerDone} />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
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
          <View style={[styles.progressFill, { width: `${exercises.length ? (completedCount / exercises.length) * 100 : 0}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {exercises.map((ex, i) => (
          <TouchableOpacity
            key={ex.id}
            style={[styles.exerciseCard, completed[i] && styles.exerciseCardDone]}
            onPress={() => toggleExercise(i)}  // index-dependent, inline is acceptable here
          >
            <View style={[styles.checkbox, completed[i] && styles.checkboxDone]}>
              {completed[i] && <Ionicons name="checkmark" size={16} color="#001A13" />}
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, completed[i] && styles.exerciseNameDone]}>{ex.name}</Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets} sets · {ex.reps}{ex.rest_seconds > 0 ? ` · ${ex.rest_seconds}s rest` : ''}
              </Text>
            </View>
            {ex.rest_seconds > 0 && (
              <TouchableOpacity
                style={styles.timerBtn}
                onPress={() => { setTimerSeconds(ex.rest_seconds); setShowTimer(true); }}  // rest_seconds-dependent
              >
                <Ionicons name="timer-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        <Animated.View style={allDone ? {
          transform: [{ scale: celebAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }]
        } : {}}>
          <TouchableOpacity
            style={[styles.finishBtn, !allDone && styles.finishBtnDisabled]}
            onPress={allDone ? handleFinish : null}
          >
            <Ionicons
              name={allDone ? 'trophy' : 'lock-closed-outline'}
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
