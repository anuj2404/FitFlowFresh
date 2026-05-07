import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function useStreak() {
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyHabits, setWeeklyHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const today = new Date();
      let currentStreak = 0;
      const weekly = [];
      const habitsWeekly = [];

      // Build last 7 days of data
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `habits_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
        const dayLabel = DAY_LABELS[d.getDay()];
        const isToday = i === 0;

        try {
          const stored = await AsyncStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            weekly.push({
              label: isToday ? 'Today' : dayLabel,
              value: parsed.saved ? 1 : 0,
              today: isToday,
              water: parsed.water || 0,
              steps: parsed.steps || 0,
              sleep: parsed.sleep || 0,
            });
            habitsWeekly.push(parsed);
          } else {
            weekly.push({ label: isToday ? 'Today' : dayLabel, value: 0, today: isToday, water: 0, steps: 0, sleep: 0 });
            habitsWeekly.push(null);
          }
        } catch {
          weekly.push({ label: isToday ? 'Today' : dayLabel, value: 0, today: isToday, water: 0, steps: 0, sleep: 0 });
          habitsWeekly.push(null);
        }
      }

      // Calculate streak (consecutive days saved going back from today)
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `habits_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
        try {
          const stored = await AsyncStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.saved) {
              currentStreak++;
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

      setStreak(currentStreak);
      setWeeklyData(weekly);
      setWeeklyHabits(habitsWeekly);
    } catch (e) {
      console.error('Failed to load streak data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Weekly averages for habit trends
  const weeklyAverages = {
    water: weeklyData.length
      ? Math.round(weeklyData.reduce((a, d) => a + d.water, 0) / weeklyData.filter(d => d.value).length || 0)
      : 0,
    steps: weeklyData.length
      ? Math.round(weeklyData.reduce((a, d) => a + d.steps, 0) / weeklyData.filter(d => d.value).length || 0)
      : 0,
    sleep: weeklyData.length
      ? parseFloat((weeklyData.reduce((a, d) => a + d.sleep, 0) / (weeklyData.filter(d => d.value).length || 1)).toFixed(1))
      : 0,
  };

  return { streak, weeklyData, weeklyAverages, loading, reload: loadStreakData };
}
