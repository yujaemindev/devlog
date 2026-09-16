<template>
  <div class="mt-8">
    <div
      v-for="key in Object.keys(expertises)"
      :key="key"
      class="mt-2"
    >
      <h2 class="mb-2 text-xl text-gray-700 font-bold dark:text-blue-200 capitalize">
        {{ key }}
      </h2>
      <ul class="flex flex-wrap gap-4 items-start">
        <li
          v-for="expertise in expertises[key]"
          :key="expertise.icon"
          class="flex items-center"
        >
          <component
            :is="expertise.icon"
            v-if="expertise.icon"
            class="h-10 w-10"
          />
        </li>
      </ul>
    </div>
    <div
      v-for="key in Object.keys(expertises_txt)"
      :key="key"
      class="mt-2"
    >
      <h2 class="mb-2 text text-gray-700 font-bold dark:text-blue-200 capitalize">
        {{ key }}
      </h2>
      <ul class="flex flex-col gap-1 items-start">
        <li
          v-for="expertise_txt in expertises_txt[key]"
          :key="expertise_txt.description"
          class="flex items-center"
        >
          <h5 class="">
            {{ expertise_txt.description }}
          </h5>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import author from "@/data/author.js"
const expertises = author.expertises
const expertises_txt = author.expertises_txt
</script>
