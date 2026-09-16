<template>
  <div>
    <header class="pt-16 pb-9 sm:pb-16 sm:text-center">
      <h1
        class="mb-4 text-8xl sm:text-4xl tracking-tight text-slate-800 font-extrabold dark:text-slate-200"
      >
        Blog
      </h1>
      <p class="text-lg text-slate-700 dark:text-slate-400">
        기술과 제품 개발 과정에서 얻은 경험을 기록합니다.
      </p>
    </header>

    <div class="space-y-16 mx-auto max-w-7xl">
      <BlogItem
        v-for="article in articles"
        :key="article.path"
        :title="article.title"
        :image="article.image"
        :description="article.description"
        :date="article.date"
        :tags="normalizeTags(article.tags)"
        :slug="article.slug || article.stem.split('/').at(-1)"
      />
    </div>
  </div>
</template>

<script setup>
import siteMetaInfo from '~/data/sitemetainfo.js'

const { data: articles } = await useAsyncData('articles', () =>
  queryCollection('articles')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all(),
)

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags
  return String(tags || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

useSeoMeta({
  title: `${siteMetaInfo.title} | Blog`,
  description: '개발, 아키텍처, 서비스 운영 경험을 기록하는 기술 블로그입니다.',
})
</script>
