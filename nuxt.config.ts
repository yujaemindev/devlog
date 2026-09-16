import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-16',
  devtools: { enabled: true },

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
