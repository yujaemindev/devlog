// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/content", "nuxt-svgo", "@nuxt/image", "@nuxtjs/tailwindcss"],
  css: ["@/assets/css/main.css"],
  components: true,
  app: {
    baseURL: '/devlog', // GitHub Pages에서 제공되는 기본 경로
  },
  content: {
    markdown: {
      anchorLinks: false,
    },
    highlight: {
      theme: "github-dark",
      langs: [
        'json',
        'js',
        'ts',
        'html',
        'css',
        'vue',
        'shell',
        'mdc',
        'md',
        'yaml',
        'c',
        'cpp',
        'java',
        'javascript',
      ],
    },
  },

  compatibilityDate: '2024-09-10',
})