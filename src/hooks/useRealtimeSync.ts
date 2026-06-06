import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * 订阅某番剧的评论/评分变化（Supabase Realtime，走 WebSocket）。
 * 一旦有人新增/修改/删除评论或评分，就让对应的 react-query 缓存失效并自动重新拉取，
 * 从而在所有正打开该页面的用户那里「实时」刷新，无需手动刷新页面。
 *
 * 未配置 Supabase 时自动跳过。
 * 依赖数据库已对 comments / ratings 开启 Realtime（见 supabase/schema.sql 末尾）。
 */
export function useRealtimeSync(subjectId: number) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!isSupabaseConfigured || !subjectId || Number.isNaN(subjectId)) return

    const filter = `subject_id=eq.${subjectId}`
    const channel = supabase
      .channel(`subject-${subjectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter },
        () => qc.invalidateQueries({ queryKey: ['comments', subjectId] }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ratings', filter },
        () =>
          qc.invalidateQueries({
            queryKey: ['ratings', 'aggregate', subjectId],
          }),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [subjectId, qc])
}
