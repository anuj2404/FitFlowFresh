import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://vdteirypgggidkrlvoiv.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdGVpcnlwZ2dnaWRrcmx2b2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTAxMjcsImV4cCI6MjA5MzcyNjEyN30.iLeoQHw2pCRkyE-HKC1gp7340cCkPd9FCuErn_No4fQ';

const safeFetch = async (input, init) => {
  const response = await fetch(input, init);
  if (response.status === 0) throw new Error('Network request failed');
  return response;
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: safeFetch },
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
