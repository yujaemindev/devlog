<template>
  <section class="mt-8">
    <div class="mb-4">
      <h2 class="text-xl text-gray-700 font-bold dark:text-blue-200">
        Career Highlights
      </h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        지금까지의 커리어를 한눈에 볼 수 있는 핵심 경험입니다.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <article
        v-for="item in highlights"
        :key="item.title"
        class="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800"
      >
        <div class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-300">
          {{ item.value }}
        </div>
        <h3 class="mt-1 text-base font-bold text-gray-800 dark:text-gray-100">
          {{ item.title }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {{ item.description }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
import author from "@/data/author.js"

const highlights = author.careerHighlights
</script>
