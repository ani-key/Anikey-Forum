import { Link } from 'react-router-dom'
import { coverUrl, displayName, type BangumiSubject } from '../types/bangumi'

export default function AnimeCard({ subject }: { subject: BangumiSubject }) {
  const cover = coverUrl(subject, 'common')
  const name = displayName(subject)
  const score = subject.rating?.score

  return (
    <Link
      to={`/anime/${subject.id}`}
      className="anime-card group flex min-h-full flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50 text-sm font-semibold text-slate-300">
            无封面
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/70 to-transparent opacity-80" />
        {typeof score === 'number' && score > 0 && (
          <span className="absolute right-2 top-2 rounded-md bg-slate-950/85 px-2 py-1 text-xs font-black text-amber-300 shadow-lg">
            ★ {score.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3
          className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900 group-hover:text-cyan-700"
          title={name}
        >
          {name}
        </h3>
        <div className="mt-auto flex min-h-6 items-center justify-between gap-2 text-xs text-slate-400">
          <span className="truncate">{subject.date ?? '放送日期未知'}</span>
          {subject.platform && (
            <span className="shrink-0 rounded-md bg-cyan-50 px-1.5 py-0.5 font-semibold text-cyan-700">
              {subject.platform}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
