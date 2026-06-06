import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import OAuthButtons from '../components/OAuthButtons'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (
    location.state as
      | { from?: { pathname: string; search?: string; hash?: string } }
      | null
  )?.from
  const redirectTo = from
    ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
    : '/'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
    else navigate(redirectTo, { replace: true })
  }

  return (
    <AuthShell
      eyebrow="Private access"
      title="登录 Anikey"
      subtitle="今晚的钥匙在这里。"
      configured={configured}
      footer={
        <>
          还没有账号？{' '}
          <Link to="/register" className="font-semibold text-rose-600 hover:text-rose-700">
            去注册
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex min-w-0 flex-col gap-4">
        <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
          邮箱
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="control-input"
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
          密码
          <input
            type="password"
            required
            placeholder="输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="control-input"
          />
        </label>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !configured}
          className="primary-button mt-1"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <OAuthButtons configured={configured} />
    </AuthShell>
  )
}
