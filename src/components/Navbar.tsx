import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const k = keyword.trim()
    if (k) navigate(`/search?q=${encodeURIComponent(k)}`)
  }

  return (
    <header className="glass-bar sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 text-slate-950"
          aria-label="Anikey 首页"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
            AK
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-black leading-5">
              Anikey
            </span>
            <span className="block truncate text-xs font-semibold text-slate-400">
              番剧论坛
            </span>
          </span>
        </Link>

        <form onSubmit={onSearch} className="order-3 flex w-full sm:order-none sm:flex-1 sm:justify-center">
          <div className="flex w-full max-w-xl rounded-lg border border-slate-200 bg-white/85 p-1 shadow-inner shadow-slate-900/5">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索番剧，例如：葬送的芙莉莲"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-cyan-700"
            >
              搜索
            </button>
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2 text-sm">
          <Link to="/me" className="secondary-button min-h-10 px-3">
            我的
          </Link>
          <button
            onClick={() => signOut()}
            className="secondary-button min-h-10 px-3 text-slate-500"
          >
            退出
          </button>
          <div className="hidden h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-cyan-500 text-sm font-black text-white shadow-lg shadow-rose-500/20 sm:grid">
            {(user?.user_metadata?.username ?? user?.email ?? 'U')
              .slice(0, 1)
              .toUpperCase()}
          </div>
        </nav>
      </div>
    </header>
  )
}
