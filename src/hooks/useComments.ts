import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Comment } from '../types/db'

/** 某番剧的全部评论（含作者资料），按时间正序，前端再组织成两级 */
export function useComments(subjectId: number) {
  return useQuery({
    queryKey: ['comments', subjectId],
    enabled: isSupabaseConfigured,
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true })
      if (error) throw error
      const comments = (data ?? []) as Comment[]
      if (comments.length === 0) return []

      // 单独查作者资料再合并：comments 与 profiles 之间没有直接外键，
      // 不能用 PostgREST 的内嵌(join)，所以这里手动关联。
      const ids = [...new Set(comments.map((c) => c.user_id))]
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', ids)
      if (pErr) throw pErr
      const map = new Map((profs ?? []).map((p) => [p.id as string, p]))
      return comments.map((c) => {
        const p = map.get(c.user_id)
        return {
          ...c,
          profiles: p
            ? { username: p.username as string, avatar_url: p.avatar_url as string | null }
            : null,
        }
      })
    },
  })
}

/** 我发表过的全部评论（个人中心），按时间倒序 */
export function useMyComments() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['comments', 'byUser', user?.id],
    enabled: isSupabaseConfigured && !!user,
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Comment[]
    },
  })
}

/** 发表评论或回复 */
export function usePostComment(subjectId: number) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      content,
      parentId = null,
    }: {
      content: string
      parentId?: string | null
    }) => {
      if (!user) throw new Error('请先登录')
      const trimmed = content.trim()
      if (!trimmed) throw new Error('评论内容不能为空')
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        subject_id: subjectId,
        parent_id: parentId,
        content: trimmed,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', subjectId] })
    },
  })
}

/** 删除自己的评论 */
export function useDeleteComment(subjectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', subjectId] })
    },
  })
}
