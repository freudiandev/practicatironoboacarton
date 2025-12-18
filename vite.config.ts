import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getGithubPagesBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  return repo ? `/${repo}/` : '/'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages sirve el sitio bajo "/<repo>/"
  base: mode === 'production' ? getGithubPagesBase() : '/'
}))
