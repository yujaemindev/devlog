<template>
  <div class="px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0 mt-10">
    <template v-if="article">
      <p class="text-center font-bold my-5 text-indigo-500">
        {{ formatDate(article.date) }}
      </p>
      <h1 class="text-4xl text-gray-700 font-extrabold mb-10 text-center dark:text-slate-200">
        {{ article.title }}
      </h1>

      <div class="flex items-center font-medium mt-6 sm:mx-3 justify-center">
        <img
          :src="authorImage"
          loading="lazy"
          alt="유재민 프로필"
          class="mr-3 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800"
        />
        <div>
          <div class="text-slate-900 dark:text-slate-200">
            {{ author.name }}
          </div>
          <a
            v-if="author.socials.twitter && author.socials.twitter !== '#'"
            target="_blank"
            :href="`https://twitter.com/${author.socials.twitter}`"
            class="text-sky-500 hover:text-sky-600 dark:text-sky-400"
          >
            @{{ author.socials.twitter }}
          </a>
        </div>
      </div>

      <img
        v-if="article.image"
        class="mx-auto w-4/5 my-10 rounded-md drop-shadow-sm"
        :src="article.image"
        :alt="article.title"
      >

      <ContentRenderer
        class="prose prose-slate dark:prose-invert min-w-full p-10 mx-auto"
        :value="article"
      />
    </template>

    <p v-else class="py-20 text-center text-gray-500">
      No content found.
    </p>
  </div>
</template>

<script setup>
import author from '~/data/author.js'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const slug = String(route.params.slug)
const authorImage = `${runtimeConfig.app.baseURL.replace(/\/$/, '')}${author.author_image}`

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryCollection('articles')
    .where('stem', '=', `articles/${slug}`)
    .first(),
)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

useSeoMeta({
  title: () => article.value?.title || 'Blog',
  description: () => article.value?.description || '',
})
</script>
