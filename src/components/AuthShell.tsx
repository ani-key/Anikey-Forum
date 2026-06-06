import type { ReactNode } from 'react'

interface AuthShellProps {
  eyebrow: string
  title: string
  subtitle: string
  configured: boolean
  children: ReactNode
  footer: ReactNode
}

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  configured,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="auth-page">
      <div
        className="auth-image"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}anime-auth-hero.png)`,
        }}
      />
      <div className="auth-vignette" />

      <main className="relative z-10 flex min-h-screen items-center py-8">
        <section className="auth-grid mx-auto grid min-w-0 max-w-6xl gap-8 lg:grid-cols-[minmax(320px,430px)_1fr] lg:items-center">
          <div className="auth-panel soft-panel min-w-0 p-5 shadow-2xl sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase text-cyan-600">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
            </div>

            {!configured && (
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                尚未配置 Supabase，账号入口暂不可用。请按 README 配置后再使用。
              </div>
            )}

            {children}

            <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
              {footer}
            </div>
          </div>

          <div className="hidden min-h-[620px] items-end lg:flex">
            <div className="max-w-xl pb-8 text-white drop-shadow-[0_8px_24px_rgba(15,23,42,0.45)]">
              <p className="text-sm font-bold uppercase text-cyan-100">
                Anikey Forum
              </p>
              <p className="mt-4 text-5xl font-black leading-tight">
                今晚也有人在同一集里停留
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
