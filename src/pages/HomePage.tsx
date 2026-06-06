import { useState } from 'react'
import { useCalendar } from '../hooks/useBangumi'
import AnimeCard from '../components/AnimeCard'
import { Loading, ErrorState, EmptyState } from '../components/ui'

// Bangumi weekday.id：1=周一 … 7=周日；JS getDay()：0=周日…6=周六
const todayId = new Date().getDay() === 0 ? 7 : new Date().getDay()
const heroImage = `${import.meta.env.BASE_URL}anime-auth-hero.png`

export default function HomePage() {
  const { data, isLoading, isError, refetch } = useCalendar()
  const [activeId, setActiveId] = useState(todayId)

  if (isLoading) return <Loading label="正在加载每日放送…" />
  if (isError || !data)
    return <ErrorState message="放送表加载失败" onRetry={() => refetch()} />

  const days = [...data].sort((a, b) => a.weekday.id - b.weekday.id)
  const active = days.find((d) => d.weekday.id === activeId)
  const totalItems = days.reduce((sum, d) => sum + d.items.length, 0)

  return (
    <div className="space-y-5">
      <section
        className="relative overflow-hidden rounded-lg border border-white/70 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/15 sm:p-7"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.72) 48%, rgba(15, 23, 42, 0.36)), url(${heroImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="relative max-w-3xl">
          <p className="text-xs font-bold uppercase text-cyan-200">
            Daily on-air board
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            今日放送
          </h1>
          <div className="mt-5 grid max-w-xl grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-2xl font-black">{active?.items.length ?? 0}</p>
              <p className="mt-1 text-cyan-100">当前日</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-2xl font-black">{totalItems}</p>
              <p className="mt-1 text-cyan-100">本周条目</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-2xl font-black">{days.length}</p>
              <p className="mt-1 text-cyan-100">频道</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="muted-label">Calendar</p>
          <h2 className="section-title">每日放送</h2>
        </div>
        {active && (
          <p className="text-sm font-semibold text-slate-500">
            {active.weekday.cn} · {active.items.length} 部
          </p>
        )}
      </div>

      <div className="soft-panel flex flex-wrap gap-2 p-2">
        {days.map((d) => (
          <button
            key={d.weekday.id}
            onClick={() => setActiveId(d.weekday.id)}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              d.weekday.id === activeId
                ? 'bg-slate-950 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-500 hover:bg-cyan-50 hover:text-cyan-800'
            }`}
          >
            {d.weekday.cn}
            {d.weekday.id === todayId && (
              <span className="ml-1 text-xs opacity-75">今天</span>
            )}
          </button>
        ))}
      </div>

      {active && active.items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {active.items.map((s) => (
            <AnimeCard key={s.id} subject={s} />
          ))}
        </div>
      ) : (
        <EmptyState>这一天暂无放送数据</EmptyState>
      )}
    </div>
  )
}
