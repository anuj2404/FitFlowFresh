import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getTodayKey = () => {
  const today = new Date();
  return `habits_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
};

const DEFAULT_HABITS = {
  water: 0,
  steps: 0,
  sleep: 7,
  mood: null,
  saved: false,
};

export default function useHabits() {
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [loading, setLoading] = useState(true);

  // Load today's habits from storage on mount
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const key = getTodayKey();
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setHabits(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load habits:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (updatedHabits) => {
    try {
      const key = getTodayKey();
      const toSave = { ...updatedHabits, saved: true };
      await AsyncStorage.setItem(key, JSON.stringify(toSave));
      setHabits(toSave);
      return true;
    } catch (e) {
      console.error('Failed to save habits:', e);
      return false;
    }
  };

  const updateHabit = (key, value) => {
    setHabits((prev) => ({ ...prev, [key]: value }));
  };

  // Load streak count across days
  const getStreak = async () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `habits_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.saved) {
            streak++;
          } else {
            break;
          }
        } else {
          break;
        }
      } catch {
        break;
      }
    }
    return streak;
  };

  return { habits, loading, updateHabit, saveHabits, getStreak };
}
