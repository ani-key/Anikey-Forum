# 🌸 Anikey 番剧论坛

一个可以**浏览番剧、打分、写评论讨论**的番剧论坛。番剧数据来自 [Bangumi 番组计划](https://bgm.tv)，用户/评分/评论由 [Supabase](https://supabase.com) 提供，前端纯静态、可一键部署到 **GitHub Pages**。

## ✨ 功能

- 🏠 **每日放送**：首页按星期展示当季新番（Bangumi `/calendar`）
- 🔍 **搜索**：按关键词查找任意番剧
- 📺 **番剧详情**：封面、简介、标签、Bangumi 评分
- ⭐ **打分**：1–10 分（五星半星），展示本站平均分
- 💬 **评论 / 讨论**：发表评论、一级回复、删除自己的评论
- ⚡ **实时更新**：别人发的评论/评分会通过 Supabase Realtime 自动出现在你当前页面，无需刷新
- 👤 **账号系统**：邮箱注册登录、个人中心查看「我的评分」
- 🔒 **登录门禁**：除登录 / 注册外，所有页面都需要登录后访问

> 没有配置 Supabase 时，站点只展示登录 / 注册入口的配置提示；番剧内容不会对未登录用户开放。

## 🧱 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | Vite + React 18 + TypeScript |
| 样式 | Tailwind CSS |
| 路由 | React Router（HashRouter，避免 Pages 刷新 404） |
| 数据请求 | TanStack Query |
| 番剧数据 | Bangumi API（支持可选代理） |
| 后端 | Supabase（Postgres + Auth + 行级权限 RLS） |
| 部署 | GitHub Actions → GitHub Pages |

---

## 🚀 本地运行

需要 Node.js ≥ 18。

```bash
npm install
npm run dev
```

打开终端提示的地址（默认 http://localhost:5173）。要进入首页、搜索、详情、评分和评论，需要继续完成下面的 Supabase 配置并登录。

---

## 🗄️ 配置 Supabase（启用登录门禁 / 评分 / 评论）

1. 到 [supabase.com](https://supabase.com) 注册（免费，无需信用卡），新建一个 Project。
2. 进入 **Project Settings → API**，复制：
   - `Project URL`
   - `anon` `public` key
3. 在项目根目录复制 `.env.example` 为 `.env`，填入：
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
   > 这两个值是公开的，安全由数据库 RLS 保证。
4. 打开 Supabase 控制台的 **SQL Editor**，把 [`supabase/schema.sql`](./supabase/schema.sql) 整段粘贴进去运行（建表 + 权限 + 触发器 + 开启实时更新）。
5. **配置注册确认链接地址（重要）**。进入 **Authentication → URL Configuration**：
   - **Site URL**：填你线上的访问地址，例如 `https://<你的用户名>.github.io/Anikey-Forum/`。
   - **Redirect URLs**：把下面这些都加进白名单（前端代码会用 `emailRedirectTo` 指定跳回地址，但该地址必须在白名单里，否则会被忽略并退回 Site URL）：
     ```
     https://<你的用户名>.github.io/Anikey-Forum/**
     http://localhost:5173/Anikey-Forum/**
     ```
   > ⚠️ 如果不做这一步，注册确认邮件里的链接会默认指向 `http://localhost:3000`，线上用户点了打不开。
6.（可选）**Authentication → Providers → Email**：开发期可关闭「Confirm email」，注册后就能直接登录；保持开启则需要去邮箱点确认链接。
7. 重启 `npm run dev`，即可注册、打分、评论。

---

## 🌏 配置 Bangumi 国内访问代理（可选）

如果当前网络无法直连 `bgm.tv` / `api.bgm.tv`，首页、搜索、详情和封面会加载失败。此时需要部署一个代理服务，再把代理地址写入环境变量。

项目内提供了 Cloudflare Worker 模板：

```
deploy/cloudflare/bangumi-proxy-worker.js
```

部署 Worker 后，假设地址是：

```
https://your-bangumi-proxy.example.workers.dev
```

本地 `.env` 增加：

```
VITE_BANGUMI_API_BASE=https://your-bangumi-proxy.example.workers.dev
VITE_BANGUMI_IMAGE_PROXY=https://your-bangumi-proxy.example.workers.dev/image
```

线上 GitHub Pages 需要在仓库 **Settings → Secrets and variables → Actions** 添加：

- `VITE_BANGUMI_API_BASE`
- `VITE_BANGUMI_IMAGE_PROXY`

然后重新运行 Pages 部署 workflow。

---

## 🌐 部署到 GitHub Pages

1. 把代码推到 GitHub 仓库（仓库名建议保持 `Anikey-Forum`；若改名，请同步修改 `vite.config.ts` 里的 `base`）。
   ```bash
   git init
   git add .
   git commit -m "init: anikey forum"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/Anikey-Forum.git
   git push -u origin main
   ```
2. 仓库 **Settings → Secrets and variables → Actions → New repository secret**，添加两个：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - 可选：`VITE_BANGUMI_API_BASE`
   - 可选：`VITE_BANGUMI_IMAGE_PROXY`
3. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 每次 push 到 `main`，[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) 会自动构建并部署。
5. 部署完成后访问：`https://<你的用户名>.github.io/Anikey-Forum/`

> ⚠️ Supabase 默认允许任意来源访问，无需额外配置 CORS。若开启了域名限制，记得把 Pages 域名加入白名单。

---

## 📁 目录结构

```
src/
├── lib/         Bangumi & Supabase 客户端
├── types/       Bangumi 响应 & 数据库行类型
├── context/     AuthContext（登录态）
├── hooks/       useBangumi / useRatings / useComments
├── components/  Navbar / AnimeCard / StarRating / CommentSection ...
└── pages/       Home / Search / AnimeDetail / Login / Register / Profile
supabase/schema.sql        数据库初始化脚本
.github/workflows/deploy.yml  自动部署
```

---

## 🙏 致谢

- 番剧数据：[Bangumi 番组计划](https://bgm.tv) · [API 文档](https://bangumi.github.io/api/)
- 后端服务：[Supabase](https://supabase.com)

仅供学习交流使用。
