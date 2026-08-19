import { defineConfig } from 'vite'

// GitHub Pages with default *.github.io URL needs base = '/DulaHQ/' (repo name)
// GitHub Pages with CUSTOM DOMAIN, Cloudflare Pages, Vercel, or local dev use base = '/'
export default defineConfig(({ mode }) => {
  const target = process.env.VITE_DEPLOY_TARGET || process.env.DEPLOY_TARGET || ''
  const hasCustomDomain = process.env.VITE_CUSTOM_DOMAIN === 'true' || process.env.CUSTOM_DOMAIN === 'true'
  // vite sets base at build time
  const isGithubRepoPath = (target === 'github' || process.env.GITHUB_PAGES === 'true') && !hasCustomDomain
  return {
    base: isGithubRepoPath ? '/DulaHQ/' : '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      host: '0.0.0.0',
      port: 5173
    }
  }
})
