import { useState } from 'react'
import { useAuth, type OAuthProvider } from '../context/AuthContext'

// 决定展示哪些第三方登录入口。默认 github + google；
// 只在 Supabase 控制台启用了某个 provider 时它才真正可用，
// 想隐藏没启用的入口，就在 .env 里设 VITE_OAUTH_PROVIDERS=github 之类。
const ENABLED = (import.meta.env.VITE_OAUTH_PROVIDERS ?? 'github,google')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

const PROVIDERS: {
  id: OAuthProvider
  label: string
  icon: React.ReactNode
}[] = [
  {
    id: 'github',
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .8 2.6 1.5 3.3 1 .1-.7.4-1.2.8-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
      </svg>
    ),
  },
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
        />
      </svg>
    ),
  },
]

/** 第三方（GitHub / Google）登录按钮，登录注册页共用 */
export default function OAuthButtons({ configured }: { configured: boolean }) {
  const { signInWithProvider } = useAuth()
  const [busy, setBusy] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const providers = PROVIDERS.filter((p) => ENABLED.includes(p.id))
  if (providers.length === 0) return null

  const go = async (provider: OAuthProvider) => {
    setError(null)
    setBusy(provider)
    // 成功会直接跳转走；只有发起失败才会回到这里
    const { error } = await signInWithProvider(provider)
    if (error) {
      setError(error)
      setBusy(null)
    }
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        或使用
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="mt-4 grid gap-2">
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => go(p.id)}
            disabled={!configured || busy !== null}
            className="secondary-button w-full gap-2"
          >
            {p.icon}
            {busy === p.id ? '跳转中…' : `用 ${p.label} 登录`}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
