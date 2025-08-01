import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// 환경변수가 없을 경우 기본값 제공 (개발 중 오류 방지)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zpqqromagyxdrrtmfqud.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcXFyb21hZ3l4ZHJydG1mcXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMjM5MzAsImV4cCI6MjA2OTU5OTkzMH0.KLU4ut86_CJi7Cnoe6BgTcYZks9k7DwFvKgbUoG7_X8'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 데모용으로 세션 지속성 비활성화
  },
})

export type { Database }