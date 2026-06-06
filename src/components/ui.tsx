import type { ReactNode } from 'react'

export function Loading({ label = '加载中…' }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="soft-panel flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <span>{label}</span>
      </div>
    </div>
  )
}

export function ErrorState({
  message = '出错了',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="soft-panel flex min-h-[260px] flex-col items-center justify-center gap-4 px-5 py-12 text-center text-slate-500">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-rose-50 text-2xl">
        !
      </div>
      <p className="font-semibold text-slate-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="primary-button min-h-10 px-5 py-2"
        >
          重试
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="soft-panel flex min-h-[240px] items-center justify-center px-5 py-12 text-center text-sm font-medium text-slate-500">
      {children}
    </div>
  )
}
