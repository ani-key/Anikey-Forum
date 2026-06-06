import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useBangumi'
import AnimeCard from '../components/AnimeCard'
import { Loading, ErrorState, EmptyState } from '../components/ui'

const PAGE_SIZE = 24

export default function SearchPage() {
  const [params] = useSearchParams()
  const keyword = params.get('q') ?? ''
  const [page, setPage] = useState(0)

  // 切换关键词时回到第一页
  useEffect(() => setPage(0), [keyword])

  const { data, isLoading, isError, refetch, isPlaceholderData } = useSearch(
    keyword,
    page,
    PAGE_SIZE,
  )

  if (!keyword.trim()) return <EmptyState>还没有关键词</EmptyState>

  const total = data?.total ?? 0
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  return (
    <div className="space-y-5">
      <section className="soft-panel flex flex-col gap-2 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="muted-label">Search</p>
          <h1 className="section-title truncate">“{keyword}”</h1>
        </div>
        {data && (
          <p className="text-sm font-semibold text-slate-500">共 {total} 部</p>
        )}
      </section>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState message="搜索失败" onRetry={() => refetch()} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState>没有找到相关番剧，换个关键词试试？</EmptyState>
      ) : (
        <>
          <div
            className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 ${
              isPlaceholderData ? 'opacity-60' : ''
            }`}
          >
            {data.data.map((s) => (
              <AnimeCard key={s.id} subject={s} />
            ))}
          </div>

          {maxPage > 0 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="secondary-button"
              >
                上一页
              </button>
              <span className="rounded-lg bg-white/80 px-3 py-2 font-bold text-slate-500">
                {page + 1} / {maxPage + 1}
              </span>
              <button
                disabled={page >= maxPage}
                onClick={() => setPage((p) => p + 1)}
                className="secondary-button"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
