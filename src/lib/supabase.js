import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nhxrovyxmidwzgsvdvnp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeHJvdnl4bWlkd3pnc3Zkdm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTM5NTUsImV4cCI6MjA4NzE4OTk1NX0.JaLFBdEFHjhkId2qH_qk7th57me5ZO_-PglZ7rrRzX0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
