<template>
  <div class="dark:bg-gray-900 mt-6">
    <div class="max-w-screen-lg md:flex mx-auto dark:bg-gray-900">
      <div class="md:w-1/3 p-2 md:flex md:justify-center">
        <AuthorCard />
      </div>
      <div class="md:w-2/3 px-8">
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
