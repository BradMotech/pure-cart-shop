import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tindaknujaloljfthmum.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbmRha251amFsb2xqZnRobXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTA5MDQsImV4cCI6MjA3MDY2NjkwNH0.qxLi15A62boD7CE4YL_hshBnLUPAzKN1uQ6z4oFXqck"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})