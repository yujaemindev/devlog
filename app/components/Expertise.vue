<template>
  <section class="mt-10">
    <h2 class="mb-4 text-xl text-gray-700 font-bold dark:text-blue-200">
      Tech & Expertise
    </h2>

    <div
      v-for="key in Object.keys(expertises)"
      :key="key"
      class="mt-5"
    >
      <h3 class="mb-2 text-base text-gray-700 font-bold dark:text-blue-200">
        {{ key }}
      </h3>
      <ul class="flex flex-wrap gap-2 items-stretch">
        <li
          v-for="expertise in expertises[key]"
          :key="`${key}-${expertise.name}`"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          <component
            :is="expertise.icon"
            v-if="expertise.icon"
            class="h-6 w-6 shrink-0"
            aria-hidden="true"
          />
          <img
            v-else-if="expertise.image"
            :src="expertise.image"
            alt=""
            width="32"
            height="24"
            class="h-6 w-8 shrink-0 object-cover object-left"
          >
          <span class="font-medium">{{ expertise.name }}</span>
        </li>
      </ul>
    </div>

    <div
      v-for="key in Object.keys(expertises_txt)"
      :key="key"
      class="mt-5"
    >
      <h3 class="mb-2 text-base text-gray-700 font-bold dark:text-blue-200">
        {{ key }}
      </h3>
      <ul class="flex flex-col gap-2 items-start">
        <li
          v-for="expertise_txt in expertises_txt[key]"
          :key="expertise_txt.description"
          class="text-sm leading-6 text-gray-600 dark:text-gray-300"
        >
          • {{ expertise_txt.description }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import author from "@/data/author.js"

const expertises = author.expertises
const expertises_txt = author.expertises_txt
</script>
