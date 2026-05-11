import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        // Manually created user — upsert a default profile row
        const { data: created, error: upsertError } = await supabase
          .from('profiles')
          .upsert({ id: user.id, name: user.email?.split('@')[0] })
          .select()
          .single();
        if (upsertError) {
          // RLS may block insert; fall back to a local placeholder so UI isn't blank
          setProfile({ id: user.id, name: user.email?.split('@')[0] });
        } else {
          setProfile(created);
        }
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('Failed to load profile:', e.message);
      setProfile({ id: user.id, name: user.email?.split('@')[0] });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (e) {
      console.error('Failed to update profile:', e.message);
    }
  };

  return { profile, loading, updateProfile, reload: loadProfile };
}
