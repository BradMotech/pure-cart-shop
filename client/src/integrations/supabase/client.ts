import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xsbfculqgnxveqdmypre.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYmZjdWxxZ254dmVxZG15cHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3Mzg0NzIsImV4cCI6MjA1MTMxNDQ3Mn0.q9rby9whyOf-8xUVJb63SvZmjlHvJ7Tcx6yzjaDfJZE"

export const supabase = createClient(supabaseUrl, supabaseKey)