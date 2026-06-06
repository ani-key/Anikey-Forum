// Bangumi API 客户端。默认直连 api.bgm.tv；如果访问环境无法直连，
// 可通过 VITE_BANGUMI_API_BASE 指向一个兼容路径的代理服务。
import type {
  BangumiSubject,
  BangumiSearchResponse,
  BangumiCalendarDay,
} from '../types/bangumi'

const configuredBase = import.meta.env.VITE_BANGUMI_API_BASE?.trim()
const BASE = (configuredBase || 'https://api.bgm.tv').replace(/\/+$/, '')

// 动画条目的 type 编号（1=书籍 2=动画 3=音乐 4=游戏 6=三次元）
export const SUBJECT_TYPE_ANIME = 2

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`Bangumi API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export interface SearchParams {
  keyword: string
  limit?: number
  offset?: number
}

/** 关键词搜索番剧（仅 type=动画） */
export async function searchSubjects({
  keyword,
  limit = 24,
  offset = 0,
}: SearchParams): Promise<BangumiSearchResponse> {
  return request<BangumiSearchResponse>(
    `/v0/search/subjects?limit=${limit}&offset=${offset}`,
    {
      method: 'POST',
      body: JSON.stringify({
        keyword,
        filter: { type: [SUBJECT_TYPE_ANIME] },
        sort: 'match',
      }),
    },
  )
}

/** 条目详情 */
export async function getSubject(id: number): Promise<BangumiSubject> {
  return request<BangumiSubject>(`/v0/subjects/${id}`)
}

/** 每日放送（首页用） */
export async function getCalendar(): Promise<BangumiCalendarDay[]> {
  return request<BangumiCalendarDay[]>(`/calendar`)
}
