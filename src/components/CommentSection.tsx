import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useComments,
  usePostComment,
  useDeleteComment,
} from '../hooks/useComments'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Comment } from '../types/db'
import { Loading, EmptyState } from './ui'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} 天前`
  return new Date(iso).toLocaleDateString('zh-CN')
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-cyan-500 text-sm font-black text-white shadow-md shadow-cyan-900/10">
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}

function CommentForm({
  subjectId,
  parentId = null,
  onDone,
  placeholder,
}: {
  subjectId: number
  parentId?: string | null
  onDone?: () => void
  placeholder?: string
}) {
  const [text, setText] = useState('')
  const post = usePostComment(subjectId)

  const submit = async () => {
    if (!text.trim()) return
    try {
      await post.mutateAsync({ content: text, parentId })
      setText('')
      onDone?.()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder ?? '写下你的想法…'}
        rows={parentId ? 2 : 3}
        className="control-input min-h-24 resize-y"
      />
      <div className="flex justify-end gap-2">
        {onDone && (
          <button
            onClick={onDone}
            className="secondary-button min-h-9 px-3 py-1.5"
          >
            取消
          </button>
        )}
        <button
          onClick={submit}
          disabled={post.isPending || !text.trim()}
          className="primary-button min-h-9 px-4 py-1.5"
        >
          {post.isPending ? '发送中...' : '发表'}
        </button>
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  replies,
  subjectId,
}: {
  comment: Comment
  replies: Comment[]
  subjectId: number
}) {
  const { user } = useAuth()
  const [replying, setReplying] = useState(false)
  const del = useDeleteComment(subjectId)

  const renderOne = (c: Comment, isReply: boolean) => {
    const name = c.profiles?.username ?? '匿名用户'
    return (
      <div className={`flex gap-3 ${isReply ? 'mt-3' : ''}`}>
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="truncate font-bold text-slate-800">{name}</span>
            <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {c.content}
          </p>
          <div className="mt-2 flex gap-3 text-xs font-bold text-slate-400">
            {!isReply && user && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="hover:text-cyan-700"
              >
                回复
              </button>
            )}
            {user?.id === c.user_id && (
              <button
                onClick={() => {
                  if (confirm('确定删除这条评论？')) del.mutate(c.id)
                }}
                className="hover:text-red-500"
              >
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      {renderOne(comment, false)}
      <div className="ml-12 border-l border-slate-100 pl-3">
        {replies.map((r) => (
          <div key={r.id}>{renderOne(r, true)}</div>
        ))}
        {replying && (
          <div className="mt-3">
            <CommentForm
              subjectId={subjectId}
              parentId={comment.id}
              placeholder={`回复 ${comment.profiles?.username ?? '该用户'}…`}
              onDone={() => setReplying(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function CommentSection({ subjectId }: { subjectId: number }) {
  const { user } = useAuth()
  const { data, isLoading } = useComments(subjectId)

  const { roots, repliesByParent } = useMemo(() => {
    const list = data ?? []
    const roots = list.filter((c) => !c.parent_id)
    const repliesByParent = new Map<string, Comment[]>()
    for (const c of list) {
      if (c.parent_id) {
        const arr = repliesByParent.get(c.parent_id) ?? []
        arr.push(c)
        repliesByParent.set(c.parent_id, arr)
      }
    }
    // 评论主楼按时间倒序（新的在上）
    roots.reverse()
    return { roots, repliesByParent }
  }, [data])

  if (!isSupabaseConfigured) {
    return (
      <EmptyState>配置 Supabase 后即可在这里评论讨论。</EmptyState>
    )
  }

  return (
    <section className="soft-panel p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="muted-label">Comments</p>
          <h2 className="section-title">评论</h2>
        </div>
        {data && (
          <p className="text-sm font-semibold text-slate-500">{data.length} 条</p>
        )}
      </div>

      {user ? (
        <CommentForm subjectId={subjectId} />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
          会话已失效 ·{' '}
          <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700">
            登录
          </Link>
        </div>
      )}

      <div className="mt-4">
        {isLoading ? (
          <Loading />
        ) : roots.length === 0 ? (
          <EmptyState>还没有评论，来抢沙发吧～</EmptyState>
        ) : (
          roots.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesByParent.get(c.id) ?? []}
              subjectId={subjectId}
            />
          ))
        )}
      </div>
    </section>
  )
}
