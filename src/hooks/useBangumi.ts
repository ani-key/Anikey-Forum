import { useQuery } from '@tanstack/react-query'
import { getCalendar, getSubject, searchSubjects } from '../lib/bangumi'

/** 每日放送（首页） */
export function useCalendar() {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: getCalendar,
    staleTime: 30 * 60 * 1000, // 放送表 30 分钟才变
  })
}

/** 番剧搜索；keyword 为空时不发请求 */
export function useSearch(keyword: string, page: number, pageSize = 24) {
  return useQuery({
    queryKey: ['search', keyword, page, pageSize],
    queryFn: () =>
      searchSubjects({ keyword, limit: pageSize, offset: page * pageSize }),
    enabled: keyword.trim().length > 0,
    placeholderData: (prev) => prev, // 翻页时保留上一页避免闪烁
  })
}

/** 番剧详情 */
export function useSubject(id: number | undefined) {
  return useQuery({
    queryKey: ['subject', id],
    queryFn: () => getSubject(id as number),
    enabled: typeof id === 'number' && !Number.isNaN(id),
  })
}
