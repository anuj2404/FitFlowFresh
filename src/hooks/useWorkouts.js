import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('name');
      if (error) throw error;
      setWorkouts(data || []);
    } catch (e) {
      console.error('Failed to load workouts:', e.message);
    } finally {
      setLoading(false);
    }
  };

  return { workouts, loading };
}

export function useExercises(workoutId) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workoutId) loadExercises();
  }, [workoutId]);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('sort_order');
      if (error) throw error;
      setExercises(data || []);
    } catch (e) {
      console.error('Failed to load exercises:', e.message);
    } finally {
      setLoading(false);
    }
  };

  return { exercises, loading };
}
