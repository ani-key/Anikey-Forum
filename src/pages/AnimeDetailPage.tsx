import { useParams, Link } from 'react-router-dom'
import { useSubject } from '../hooks/useBangumi'
import {
  useScoreAggregate,
  useMyRating,
  useRateMutation,
} from '../hooks/useRatings'
import { useRealtimeSync } from '../hooks/useRealtimeSync'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { coverUrl, displayName } from '../types/bangumi'
import StarRating from '../components/StarRating'
import CommentSection from '../components/CommentSection'
import { Loading, ErrorState } from '../components/ui'

function RatingPanel({ subjectId }: { subjectId: number }) {
  const { user } = useAuth()
  const agg = useScoreAggregate(subjectId)
  const mine = useMyRating(subjectId)
  const rate = useRateMutation(subjectId)

  if (!isSupabaseConfigured) {
    return (
      <div className="soft-panel p-4 text-sm font-medium text-slate-500">
        配置 Supabase 后即可在本站打分。
      </div>
    )
  }

  const average = agg.data?.average ?? 0
  const count = agg.data?.count ?? 0

  return (
    <div className="soft-panel p-5">
      <p className="muted-label">Anikey score</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-4xl font-black text-amber-500">
          {count ? average.toFixed(1) : '—'}
        </span>
        <span className="pb-1 text-sm font-semibold text-slate-400">{count} 人评分</span>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        {user ? (
          <>
            <p className="mb-3 text-sm font-bold text-slate-700">
              {mine.data ? '我的评分' : '给它打个分'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <StarRating
                value={mine.data?.score ?? 0}
                onChange={(v) => rate.mutate(v)}
                size={28}
              />
              <span className="text-sm font-semibold text-slate-500">
                {mine.data ? `${mine.data.score} / 10` : ''}
                {rate.isPending && ' 保存中...'}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm font-medium text-slate-500">
            会话已失效 ·{' '}
            <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700">
              登录
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const subjectId = Number(id)
  const { data: subject, isLoading, isError, refetch } = useSubject(subjectId)

  // 订阅本番的评论/评分实时变化（多人同步）
  useRealtimeSync(subjectId)

  if (isLoading) return <Loading label="加载番剧详情…" />
  if (isError || !subject)
    return <ErrorState message="番剧详情加载失败" onRetry={() => refetch()} />

  const cover = coverUrl(subject, 'large')
  const name = displayName(subject)
  const bgmScore = subject.rating?.score

  return (
    <div className="space-y-6">
      <section className="soft-panel overflow-hidden p-4 sm:p-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="mx-auto w-48 md:mx-0 md:w-full">
            <div className="overflow-hidden rounded-lg bg-slate-100 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/10">
            {cover ? (
              <img
                src={cover}
                alt={name}
                referrerPolicy="no-referrer"
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50 text-slate-300">
                无封面
              </div>
            )}
            </div>
          </div>

          <div className="min-w-0">
            <p className="muted-label">Anime detail</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {name}
            </h1>
            {subject.name_cn && subject.name !== subject.name_cn && (
              <p className="mt-1 break-words text-sm font-semibold text-slate-400">
                {subject.name}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
              {subject.date && (
                <span className="rounded-lg bg-slate-100 px-3 py-1.5">
                  {subject.date}
                </span>
              )}
              {subject.platform && (
                <span className="rounded-lg bg-cyan-50 px-3 py-1.5 text-cyan-700">
                  {subject.platform}
                </span>
              )}
              {!!subject.total_episodes && (
                <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">
                  共 {subject.total_episodes} 话
                </span>
              )}
              {typeof bgmScore === 'number' && bgmScore > 0 && (
                <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
                  Bangumi {bgmScore.toFixed(1)}
                </span>
              )}
            </div>

            {subject.tags && subject.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {subject.tags.slice(0, 14).map((t) => (
                  <span
                    key={t.name}
                    className="rounded-md border border-cyan-100 bg-white/80 px-2 py-1 text-xs font-semibold text-cyan-800"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}

            {subject.summary && (
              <p className="mt-5 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {subject.summary}
              </p>
            )}

            <div className="mt-6 max-w-md">
              <RatingPanel subjectId={subjectId} />
            </div>
          </div>
        </div>
      </section>

      <CommentSection subjectId={subjectId} />
    </div>
  )
}
