import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const getToday = () => new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

const DEFAULT_HABITS = { water: 0, steps: 0, sleep: 7, mood: null, saved: false };

export default function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadHabits();
  }, [user]);

  const loadHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', getToday())
        .maybeSingle();
      if (error) throw error;
      if (data) setHabits(data);
    } catch (e) {
      console.error('Failed to load habits:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (updatedHabits) => {
    try {
      const { error } = await supabase
        .from('habit_logs')
        .upsert({
          user_id: user.id,
          date: getToday(),
          water: updatedHabits.water,
          steps: updatedHabits.steps,
          sleep: updatedHabits.sleep,
          mood: updatedHabits.mood,
          saved: true,
        }, { onConflict: 'user_id,date' });
      if (error) throw error;
      setHabits({ ...updatedHabits, saved: true });
      return true;
    } catch (e) {
      console.error('Failed to save habits:', e.message);
      return false;
    }
  };

  const updateHabit = (key, value) => {
    setHabits((prev) => ({ ...prev, [key]: value }));
  };

  return { habits, loading, updateHabit, saveHabits };
}
