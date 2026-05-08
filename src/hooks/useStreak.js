import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyAverages, setWeeklyAverages] = useState({ water: 0, steps: 0, sleep: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStreakData();
  }, [user]);

  const loadStreakData = async () => {
    try {
      const today = new Date();

      // Build last 30 days date range for streak + last 7 for weekly chart
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);

      const { data, error } = await supabase
        .from('habit_logs')
        .select('date, water, steps, sleep, saved')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Map data by date string for quick lookup
      const byDate = {};
      (data || []).forEach((row) => { byDate[row.date] = row; });

      // Calculate streak (consecutive saved days going back from today)
      let currentStreak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (byDate[key]?.saved) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Build last 7 days for chart
      const weekly = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const row = byDate[key];
        weekly.push({
          label: i === 0 ? 'Today' : DAY_LABELS[d.getDay()],
          value: row?.saved ? 1 : 0,
          today: i === 0,
          water: row?.water || 0,
          steps: row?.steps || 0,
          sleep: row?.sleep || 0,
        });
      }

      // Weekly averages (only days that were saved)
      const savedDays = weekly.filter((d) => d.value > 0);
      const count = savedDays.length || 1;
      const averages = {
        water: Math.round(savedDays.reduce((a, d) => a + d.water, 0) / count),
        steps: Math.round(savedDays.reduce((a, d) => a + d.steps, 0) / count),
        sleep: parseFloat((savedDays.reduce((a, d) => a + d.sleep, 0) / count).toFixed(1)),
      };

      setStreak(currentStreak);
      setWeeklyData(weekly);
      setWeeklyAverages(averages);
    } catch (e) {
      console.error('Failed to load streak data:', e.message);
    } finally {
      setLoading(false);
    }
  };

  return { streak, weeklyData, weeklyAverages, loading, reload: loadStreakData };
}
