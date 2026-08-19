import { defineConfig } from 'vite'

// GitHub Pages needs base = '/DulaHQ/' (repo name)
// Cloudflare Pages & local dev use base = '/'
export default defineConfig(({ mode }) => {
  const target = process.env.VITE_DEPLOY_TARGET || process.env.DEPLOY_TARGET || ''
  // vite sets base at build time; for github we need /DulaHQ/
  const isGithub = target === 'github' || process.env.GITHUB_PAGES === 'true'
  return {
    base: isGithub ? '/DulaHQ/' : '/',
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
