<template>
  <div class="dark:bg-gray-900 mt-6">
    <div class="max-w-screen-lg mx-auto px-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 dark:bg-gray-900">
      <div class="min-w-0 py-2">
        <AuthorCard />
      </div>
      <div class="min-w-0">
        <AuthorIntro />
        <CareerHighlights />
        <Expertise />
        <TimeLine />
      </div>
    </div>
  </div>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo"

const runtimeConfig = useRuntimeConfig()
useHead({
  link: [{ rel: "icon", type: "image/x-icon", href: `${runtimeConfig.app.baseURL}favicon.ico` }],
})

useSeoMeta({
  title: siteMetaInfo.title,
  description: siteMetaInfo.description,
})
</script>

<style></style>
