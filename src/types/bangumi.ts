// Bangumi API (bgm.tv) 返回结构的精简类型定义
// 仅声明本项目用到的字段，完整文档见 https://bangumi.github.io/api/

export interface BangumiImages {
  small: string
  grid: string
  large: string
  medium: string
  common: string
}

export interface BangumiRating {
  rank?: number
  total: number
  score: number
  count?: Record<string, number>
}

export interface BangumiTag {
  name: string
  count: number
}

/** 搜索结果 / 条目的通用形态 */
export interface BangumiSubject {
  id: number
  type: number
  name: string
  name_cn: string
  summary?: string
  date?: string | null
  platform?: string
  images: BangumiImages | null
  rating?: BangumiRating
  tags?: BangumiTag[]
  eps?: number
  total_episodes?: number
}

/** POST /v0/search/subjects 的返回 */
export interface BangumiSearchResponse {
  total: number
  limit: number
  offset: number
  data: BangumiSubject[]
}

/** GET /calendar 单日 */
export interface BangumiCalendarDay {
  weekday: { en: string; cn: string; ja: string; id: number }
  items: BangumiSubject[]
}

/** 取中文名优先、回退原名 */
export function displayName(s: Pick<BangumiSubject, 'name' | 'name_cn'>): string {
  return s.name_cn?.trim() || s.name
}

function withImageProxy(url: string): string {
  // Bangumi 返回的封面常是 http://，但本站是 https（会被浏览器按“混合内容”拦截），
  // 且图片代理只接受 https，所以统一升级成 https。lain.bgm.tv 本身支持 https。
  const httpsUrl = url.replace(/^http:\/\//i, 'https://')

  const proxy = import.meta.env.VITE_BANGUMI_IMAGE_PROXY?.trim()
  if (!proxy) return httpsUrl

  const encoded = encodeURIComponent(httpsUrl)
  if (proxy.includes('{url}')) return proxy.replace('{url}', encoded)

  const separator = proxy.includes('?') ? '&' : '?'
  return `${proxy}${separator}url=${encoded}`
}

/** 取封面 url，按清晰度回退；无图返回 null */
export function coverUrl(
  s: Pick<BangumiSubject, 'images'>,
  size: keyof BangumiImages = 'common',
): string | null {
  if (!s.images) return null
  const url = s.images[size] || s.images.common || s.images.large || null
  return url ? withImageProxy(url) : null
}
