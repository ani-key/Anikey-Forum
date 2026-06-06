import type { ReactNode } from 'react'
import Navbar from './Navbar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame app-backdrop flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-white/70 bg-white/55 py-5 text-center text-xs text-slate-500 backdrop-blur">
        <p>
          番剧数据来自{' '}
          <a
            href="https://bgm.tv"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-cyan-700 hover:text-rose-600"
          >
            Bangumi 番组计划
          </a>
          ，评分与评论由社区用户提供。
        </p>
        <p className="mt-1">Anikey Forum · 仅供学习交流</p>
      </footer>
    </div>
  )
}
