import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { signUp, configured } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }
    setLoading(true)
    const { error, needConfirm } = await signUp(email, password, username)
    setLoading(false)
    if (error) {
      setError(error)
    } else if (needConfirm) {
      setInfo('注册成功！请前往邮箱点击确认链接后再登录。')
    } else {
      navigate('/')
    }
  }

  return (
    <AuthShell
      eyebrow="New member"
      title="创建账号"
      subtitle="给自己留一个座位。"
      configured={configured}
      footer={
        <>
          已有账号？{' '}
          <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700">
            去登录
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex min-w-0 flex-col gap-4">
        <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
          昵称
          <input
            required
            placeholder="你的社区名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="control-input"
          />
        </label>
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
            placeholder="至少 6 位"
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
        {info && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {info}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !configured}
          className="primary-button mt-1"
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
    </AuthShell>
  )
}
