import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://emiyikefpwmjwxsfbqhj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaXlpa2VmcHdtand4c2ZicWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTI2NDQsImV4cCI6MjA3NjYyODY0NH0.20uXeZGYNy-IhATe6L0fW2GQvsKlrm8IlxNZNRAmUcs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});