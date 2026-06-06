import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Rating, ScoreAggregate } from '../types/db'

/** 某番剧的本站平均分与评分人数 */
export function useScoreAggregate(subjectId: number) {
  return useQuery({
    queryKey: ['ratings', 'aggregate', subjectId],
    enabled: isSupabaseConfigured,
    queryFn: async (): Promise<ScoreAggregate> => {
      const { data, error } = await supabase
        .from('ratings')
        .select('score')
        .eq('subject_id', subjectId)
      if (error) throw error
      const scores = (data ?? []).map((r) => r.score as number)
      const count = scores.length
      const average = count
        ? scores.reduce((a, b) => a + b, 0) / count
        : 0
      return { average, count }
    },
  })
}

/** 当前用户对某番剧的评分（未评过返回 null） */
export function useMyRating(subjectId: number) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['ratings', 'mine', subjectId, user?.id],
    enabled: isSupabaseConfigured && !!user,
    queryFn: async (): Promise<Rating | null> => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data as Rating | null
    },
  })
}

/** 提交/更新我的评分（每人每番唯一，upsert） */
export function useRateMutation(subjectId: number) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (score: number) => {
      if (!user) throw new Error('请先登录')
      const { error } = await supabase.from('ratings').upsert(
        {
          user_id: user.id,
          subject_id: subjectId,
          score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,subject_id' },
      )
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ratings', 'aggregate', subjectId] })
      qc.invalidateQueries({ queryKey: ['ratings', 'mine', subjectId] })
      qc.invalidateQueries({ queryKey: ['ratings', 'byUser'] })
    },
  })
}

/** 我评过的全部番剧（个人中心） */
export function useMyRatings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['ratings', 'byUser', user?.id],
    enabled: isSupabaseConfigured && !!user,
    queryFn: async (): Promise<Rating[]> => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Rating[]
    },
  })
}
