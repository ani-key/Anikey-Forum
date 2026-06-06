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

/**
 * 注册确认 / 找回密码等邮件里「跳回本站」的地址。
 *
 * 不显式传这个值时，Supabase 会回退到控制台里的 Site URL（默认是
 * http://localhost:3000），于是线上用户收到的确认链接会错误地指向 localhost。
 *
 * 这里优先用 VITE_SITE_URL（部署到自定义域名时填完整地址），否则用当前页面的
 * origin + Vite base，从而本地开发和 GitHub Pages 上都自动指向正确的地址。
 *
 * 注意：该地址还必须加入 Supabase 控制台 Authentication → URL Configuration
 * 的 Redirect URLs 白名单，否则 Supabase 会忽略它并退回到 Site URL。
 */
export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '') + '/'
  if (typeof window !== 'undefined') {
    return window.location.origin + import.meta.env.BASE_URL
  }
  return '/'
}
