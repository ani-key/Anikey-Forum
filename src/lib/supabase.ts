import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * 是否已配置 Supabase。站点现在要求登录后才能访问番剧内容；
 * 未配置时只展示登录/注册入口的配置提示。
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('your-project-ref'),
)

// 未配置时给一个占位 client，避免 createClient 抛错。
export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
