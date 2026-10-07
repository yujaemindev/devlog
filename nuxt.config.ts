import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const packageManifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const packageLock = JSON.parse(readFileSync(new URL('./package-lock.json', import.meta.url), 'utf8'))
const libraryVersions = [
  { title: '사용 라이브러리', dependencies: packageManifest.dependencies },
  { title: '개발 도구', dependencies: packageManifest.devDependencies },
].map(({ title, dependencies }) => ({
  title,
  libraries: Object.keys(dependencies).sort().map(name => {
    const version = packageLock.packages[`node_modules/${name}`]?.version
    if (!version) throw new Error(`라이브러리 버전을 확인할 수 없습니다: ${name}`)
    return { name, version }
  }),
}))

export default defineNuxtConfig({
  compatibilityDate: '2026-09-16',
  devtools: { enabled: true },

  runtimeConfig: {
    public: { libraryVersions },
  },

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    'nuxt-svgo',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/devlog/',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: ['c', 'cpp', 'java'],
        },
      },
    },
    renderer: {
      anchorLinks: false,
    },
    experimental: {
      sqliteConnector: 'native',
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
