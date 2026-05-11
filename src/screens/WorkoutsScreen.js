import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts } from '../hooks/useWorkouts';
import useProfile from '../hooks/useProfile';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const CATEGORIES = ['All', 'Strength', 'Cardio', 'Flexibility', 'HIIT'];

const DIFFICULTY_COLOR = {
  Beginner:     COLORS.primary,
  Intermediate: COLORS.warning,
  Advanced:     COLORS.danger,
};

// Map goal → recommended category
const GOAL_CATEGORY = {
  lose:      'Cardio',
  muscle:    'Strength',
  endurance: 'Cardio',
  flex:      'Flexibility',
};

// Map level → difficulty label
const LEVEL_DIFFICULTY = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
};

export default function WorkoutsScreen({ navigation }) {
  const { workouts, loading } = useWorkouts();
  const { profile } = useProfile();

  const defaultCategory = GOAL_CATEGORY[profile?.goal] || 'All';
  const [activeCategory, setActiveCategory] = useState(null);

  // Set default category once profile loads
  useEffect(() => {
    if (profile?.goal && activeCategory === null) {
      setActiveCategory(GOAL_CATEGORY[profile.goal] || 'All');
    }
  }, [profile?.goal]);

  const category = activeCategory ?? 'All';
  const userDifficulty = LEVEL_DIFFICULTY[profile?.level];

  const filtered = category === 'All'
    ? workouts
    : workouts.filter((w) => w.category === category);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Workouts</Text>
          {profile?.goal && (
            <Text style={styles.subtitle}>
              Recommended for your goal
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={16} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              category === cat && styles.chipActive,
              cat !== 'All' && cat === defaultCategory && category !== cat && styles.chipRecommended,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
              {cat}
            </Text>
            {cat !== 'All' && cat === defaultCategory && category !== cat && (
              <View style={styles.recommendedDot} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No workouts in this category.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isUserLevel = userDifficulty && item.difficulty === userDifficulty;
            return (
              <TouchableOpacity
                style={[styles.card, isUserLevel && styles.cardHighlighted]}
                onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.emojiBox}>
                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardNameRow}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      {isUserLevel && (
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchBadgeText}>Your level</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardMeta}>
                      {item.duration} · {item.exercises_count} exercises
                    </Text>
                    <View style={styles.difficultyBadge}>
                      <View style={[styles.difficultyDot, { backgroundColor: DIFFICULTY_COLOR[item.difficulty] }]} />
                      <Text style={[styles.difficultyText, isUserLevel && { color: DIFFICULTY_COLOR[item.difficulty] }]}>
                        {item.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: 28, color: COLORS.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 12, color: COLORS.primary, marginTop: 2, fontWeight: '500' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.primary },
  addBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  categoriesScroll: { flexGrow: 0 },
  categories: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm, alignItems: 'center' },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipRecommended: { borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#001A13', fontWeight: '700' },
  recommendedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary },

  list: { padding: SPACING.md, paddingTop: SPACING.sm, gap: SPACING.sm },
  emptyCard: { padding: SPACING.lg, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border },
  cardHighlighted: { borderColor: COLORS.primary + '55' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  emojiBox: { width: 52, height: 52, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  cardName: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  matchBadge: { backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 },
  matchBadgeText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  difficultyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  difficultyDot: { width: 6, height: 6, borderRadius: 3 },
  difficultyText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
});
