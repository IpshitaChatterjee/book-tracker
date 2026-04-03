import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://klzpaijksnajsxakofzk.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsenBhaWprc25hanN4YWtvZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyODE5NTEsImV4cCI6MjA4Mjg1Nzk1MX0.xl7tIYX5hESqmRpot0VdGnfXqnsGkqgCVMqiDLe_Ol0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const OWNER_UUID = '00000000-0000-0000-0000-000000000001';
