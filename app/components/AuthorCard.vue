<template>
  <div class="w-full min-w-0 md:sticky md:top-[calc(var(--site-header-height,89px)+1.5rem)]">
    <div class="flex items-start gap-4 sm:gap-6 md:block" :style="{ '--profile-text-height': `${profileTextHeight}px` }">
      <img
        :src="authorImage"
        loading="lazy"
        alt="me"
        class="shadow-xl aspect-square h-auto w-[var(--profile-text-height)] shrink-0 rounded-full object-cover md:w-full md:max-w-60"
      />
      <div ref="profileText" class="min-w-0 flex-1 md:mb-2 md:mt-4">
        <h1
          class="md:text-3xl text-2xl text-gray-800 font-bold dark:text-blue-100"
        >
          {{ author.name }}
        </h1>
        <div class="text-sm sm:text-base md:text-lg text-gray-600 dark:text-blue-100">
          {{ author.position }}
        </div>
        <a
          :href="`mailto:${author.email}`"
          class="inline-block text-xs sm:text-sm text-gray-600 md:hidden mt-1 break-all dark:text-blue-100"
        >
          {{ author.email }}
        </a>
      </div>
    </div>

    <div class="hidden md:block">
      <div class="my-2 text-gray-600 flex dark:text-blue-100">
        <Mail class="shrink-0" />
        <a class="min-w-0 break-all" :href="`mailto:${author.email}`"> {{ author.email }}</a>
      </div>
      <div class="my-2 text-gray-600 flex dark:text-blue-100">
        <Glob />
        <p>{{ author.location }}</p>
      </div>
      <div class="my-2 text-gray-600 flex dark:text-blue-200">
        <Github />
        <a :href="`https://github.com/${author.github}`"> {{ author.github }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import author from "@/data/author.js"
import Mail from "~/assets/icons/mail.svg?skipsvgo"
import Glob from "~/assets/icons/glob.svg?skipsvgo"
import Github from "~/assets/icons/github_new.svg?skipsvgo"

const runtimeConfig = useRuntimeConfig()
const authorImage = `${runtimeConfig.app.baseURL.replace(/\/$/, "")}${author.author_image}`

const profileText = ref(null)
const profileTextHeight = ref(96)
let profileObserver
let profileFrame = 0

onMounted(() => {
  const updatePhotoSize = () => {
    cancelAnimationFrame(profileFrame)
    profileFrame = requestAnimationFrame(() => {
      if (!profileText.value) return
      const height = profileText.value.getBoundingClientRect().height
      if (height > 0) profileTextHeight.value = height
    })
  }
  profileObserver = new ResizeObserver(updatePhotoSize)
  profileObserver.observe(profileText.value)
  updatePhotoSize()
})

onBeforeUnmount(() => {
  profileObserver?.disconnect()
  cancelAnimationFrame(profileFrame)
})
</script>
