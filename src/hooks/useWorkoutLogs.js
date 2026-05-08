import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function useWorkoutLogs() {
  const { user } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    try {
      const [logsRes, countRes] = await Promise.all([
        supabase
          .from('workout_logs')
          .select('id, completed_at, exercises_completed, workouts(name, emoji, category, duration)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5),
        supabase
          .from('workout_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      if (logsRes.error) throw logsRes.error;
      if (countRes.error) throw countRes.error;

      setRecentWorkouts(logsRes.data || []);
      setTotalCount(countRes.count || 0);
    } catch (e) {
      console.error('Failed to load workout logs:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const logWorkout = async (workoutId, exercisesCompleted) => {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .insert({ user_id: user.id, workout_id: workoutId, exercises_completed: exercisesCompleted });
      if (error) throw error;
      await load();
    } catch (e) {
      console.error('Failed to log workout:', e.message);
    }
  };

  return { recentWorkouts, totalCount, loading, logWorkout, reload: load };
}
