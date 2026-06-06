import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMyRatings } from '../hooks/useRatings'
import { useMyComments } from '../hooks/useComments'
import { useSubject } from '../hooks/useBangumi'
import { coverUrl, displayName } from '../types/bangumi'
import StarRating from '../components/StarRating'
import { Loading, EmptyState } from '../components/ui'
import type { Comment, Rating } from '../types/db'

function RatingRow({ rating }: { rating: Rating }) {
  const { data: subject } = useSubject(rating.subject_id)
  const cover = subject ? coverUrl(subject, 'small') : null

  return (
    <Link
      to={`/anime/${rating.subject_id}`}
      className="anime-card flex items-center gap-3 p-3"
    >
      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-cyan-50" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">
          {subject ? displayName(subject) : `条目 #${rating.subject_id}`}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <StarRating value={rating.score} readOnly size={16} />
          <span className="text-xs font-semibold text-slate-400">
            {rating.score} / 10
          </span>
        </div>
      </div>
    </Link>
  )
}

function CommentRow({ comment }: { comment: Comment }) {
  const { data: subject } = useSubject(comment.subject_id)
  const cover = subject ? coverUrl(subject, 'small') : null

  return (
    <Link
      to={`/anime/${comment.subject_id}`}
      className="anime-card flex gap-3 p-3"
    >
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-cyan-50" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-bold text-cyan-700">
            {comment.parent_id ? '回复 · ' : ''}
            {subject ? displayName(subject) : `条目 #${comment.subject_id}`}
          </p>
          <span className="shrink-0 text-xs text-slate-400">
            {new Date(comment.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
          {comment.content}
        </p>
      </div>
    </Link>
  )
}

export default function ProfilePage() {
  const { user, loading, configured } = useAuth()
  const { data, isLoading } = useMyRatings()
  const { data: comments, isLoading: commentsLoading } = useMyComments()

  if (!configured)
    return (
      <EmptyState>配置 Supabase 后即可登录并查看个人评分。</EmptyState>
    )
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="space-y-5">
      <section className="soft-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-cyan-500 text-xl font-black text-white shadow-lg shadow-cyan-900/10">
            {(user.user_metadata?.username ?? user.email ?? 'U')
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="muted-label">Profile</p>
            <p className="truncate text-xl font-black text-slate-950">
              {user.user_metadata?.username ?? '用户'}
            </p>
            <p className="truncate text-sm font-medium text-slate-400">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-slate-950 px-4 py-3 text-white sm:flex-none">
            <p className="text-2xl font-black">{data?.length ?? 0}</p>
            <p className="text-xs font-semibold text-cyan-100">评分记录</p>
          </div>
          <div className="flex-1 rounded-lg bg-slate-950 px-4 py-3 text-white sm:flex-none">
            <p className="text-2xl font-black">{comments?.length ?? 0}</p>
            <p className="text-xs font-semibold text-rose-100">评论</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="muted-label">My ratings</p>
            <h2 className="section-title">
              我的评分 {data ? `(${data.length})` : ''}
            </h2>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : !data || data.length === 0 ? (
          <EmptyState>
            评分记录还是空的 ·{' '}
            <Link to="/" className="font-semibold text-rose-600 hover:text-rose-700">
              首页
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((r) => (
              <RatingRow key={r.id} rating={r} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="muted-label">My comments</p>
            <h2 className="section-title">
              我的评论 {comments ? `(${comments.length})` : ''}
            </h2>
          </div>
        </div>

        {commentsLoading ? (
          <Loading />
        ) : !comments || comments.length === 0 ? (
          <EmptyState>
            还没有发表过评论 ·{' '}
            <Link to="/" className="font-semibold text-rose-600 hover:text-rose-700">
              去逛逛
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {comments.map((c) => (
              <CommentRow key={c.id} comment={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
