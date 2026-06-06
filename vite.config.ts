import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目站点会部署在 https://<user>.github.io/<repo>/ 下，
// 因此 base 必须是仓库名。本地开发(dev/preview)不受影响。
// 如果你把仓库改成别的名字，或绑定了自定义域名，请同步修改这里。
export default defineConfig({
  base: '/Anikey-Forum/',
  plugins: [react()],
})
