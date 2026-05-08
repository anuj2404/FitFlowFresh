import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'lose', label: 'Lose Weight', emoji: '⚖️', desc: 'Burn fat and get leaner' },
  { id: 'muscle', label: 'Build Muscle', emoji: '💪', desc: 'Get stronger and bigger' },
  { id: 'endurance', label: 'Endurance', emoji: '🏃', desc: 'Run farther, last longer' },
  { id: 'flex', label: 'Flexibility', emoji: '🧘', desc: 'Move better, feel better' },
];

const STEP_COUNT = 3;

export default function OnboardingScreen({ onComplete, authCredentials }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = (nextStep) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step < STEP_COUNT - 1) animateStep(step + 1);
    else handleFinish();
  };

  const { signUp } = useAuth();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signUp(authCredentials.email, authCredentials.password, {
        name: name.trim() || 'Athlete',
        goal,
        level,
      });
      onComplete();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return goal !== null;
    if (step === 2) return level !== null;
    return false;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array(STEP_COUNT).fill(0).map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
          ))}
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Step 0 - Name */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.stepTitle}>Welcome to FitFlow</Text>
              <Text style={styles.stepSub}>Let's personalize your experience. What should we call you?</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
              />
            </View>
          )}

          {/* Step 1 - Goal */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={styles.stepTitle}>What's your main goal?</Text>
              <Text style={styles.stepSub}>We'll tailor your workouts around this.</Text>
              <View style={styles.optionGrid}>
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.optionCard, goal === g.id && styles.optionCardActive]}
                    onPress={() => setGoal(g.id)}
                  >
                    <Text style={styles.optionEmoji}>{g.emoji}</Text>
                    <Text style={[styles.optionLabel, goal === g.id && styles.optionLabelActive]}>{g.label}</Text>
                    <Text style={styles.optionDesc}>{g.desc}</Text>
                    {goal === g.id && (
                      <View style={styles.optionCheck}>
                        <Ionicons name="checkmark" size={12} color="#001A13" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2 - Level */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>💪</Text>
              <Text style={styles.stepTitle}>Your fitness level?</Text>
              <Text style={styles.stepSub}>Be honest — we'll start you at the right intensity.</Text>
              <View style={styles.levelList}>
                {[
                  { id: 'beginner', label: 'Beginner', desc: 'New to working out or getting back into it', icon: '🌱' },
                  { id: 'intermediate', label: 'Intermediate', desc: 'Working out consistently for 6+ months', icon: '⚡' },
                  { id: 'advanced', label: 'Advanced', desc: 'Training seriously for 2+ years', icon: '🔥' },
                ].map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.levelCard, level === l.id && styles.levelCardActive]}
                    onPress={() => setLevel(l.id)}
                  >
                    <Text style={styles.levelIcon}>{l.icon}</Text>
                    <View style={styles.levelInfo}>
                      <Text style={[styles.levelLabel, level === l.id && styles.levelLabelActive]}>{l.label}</Text>
                      <Text style={styles.levelDesc}>{l.desc}</Text>
                    </View>
                    {level === l.id && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Error */}
        {error && (
          <Text style={{ color: COLORS.danger, textAlign: 'center', marginHorizontal: SPACING.md, marginBottom: SPACING.sm, fontSize: 13 }}>
            {error}
          </Text>
        )}

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, (!canProceed() || submitting) && styles.nextBtnDisabled]}
            onPress={canProceed() && !submitting ? handleNext : null}
          >
            {submitting
              ? <ActivityIndicator color="#001A13" />
              : <>
                  <Text style={[styles.nextBtnText, !canProceed() && styles.nextBtnTextDisabled]}>
                    {step === STEP_COUNT - 1 ? "Let's Go 🚀" : 'Continue'}
                  </Text>
                  {canProceed() && <Ionicons name="arrow-forward" size={18} color="#001A13" />}
                </>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: SPACING.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgInput },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  dotDone: { backgroundColor: COLORS.primaryDark },
  content: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.xl },
  stepContent: { flex: 1 },
  emoji: { fontSize: 48, marginBottom: SPACING.md },
  stepTitle: { fontSize: 28, color: COLORS.textPrimary, fontWeight: '700', marginBottom: SPACING.sm },
  stepSub: { fontSize: 15, color: COLORS.textSecondary, marginBottom: SPACING.xl, lineHeight: 22 },
  input: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 18, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  optionCard: { width: (width - SPACING.md * 2 - SPACING.sm) / 2, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
  optionCardActive: { borderColor: COLORS.primary },
  optionEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  optionLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600', marginBottom: 4 },
  optionLabelActive: { color: COLORS.primary },
  optionDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16 },
  optionCheck: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  levelList: { gap: SPACING.sm },
  levelCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  levelCardActive: { borderColor: COLORS.primary },
  levelIcon: { fontSize: 28 },
  levelInfo: { flex: 1 },
  levelLabel: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '600' },
  levelLabelActive: { color: COLORS.primary },
  levelDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  footer: { padding: SPACING.md, paddingBottom: SPACING.lg },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md },
  nextBtnDisabled: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  nextBtnText: { fontSize: 16, color: '#001A13', fontWeight: '700' },
  nextBtnTextDisabled: { color: COLORS.textMuted },
});
