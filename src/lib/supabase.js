import { createClient } from '@supabase/supabase-js'
const SB_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pqonrgstwlnfnxnwcpfw.supabase.co'
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxb25yZ3N0d2xuZm54bndjcGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTIxNDgsImV4cCI6MjA5MzYyODE0OH0.dGx1xKn4iuxmUkQ1rP2w7VbXzX6pmIpSZBFIiS0M7TU'
export const sb = createClient(SB_URL, SB_KEY)
export { SB_URL, SB_KEY }
