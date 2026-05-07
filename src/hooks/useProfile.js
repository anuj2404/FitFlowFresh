import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useProfile() {
  const [profile, setProfile] = useState({ name: 'Athlete', goal: null, level: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_profile');
      if (stored) setProfile(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updated = { ...profile, ...updates };
      await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
      setProfile(updated);
    } catch (e) {
      console.error('Failed to update profile:', e);
    }
  };

  return { profile, loading, updateProfile, reload: loadProfile };
}
