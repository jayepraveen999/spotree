import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kgpzdztntwrpwelsnmwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncHpkenRudHdycHdlbHNubXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODYxOTksImV4cCI6MjA5NDM2MjE5OX0.3YQ92WRjtFRkNJURzQgl8-zFNXv1-v1l66zyxgjQR8Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
