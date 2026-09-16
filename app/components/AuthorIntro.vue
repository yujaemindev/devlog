<template>
  <div class="mb-6">
    <template v-if="intro">
      <h2
        class="mt-6 text-4xl text-gray-700 font-bold capitalize dark:text-blue-200"
      >
        {{ intro.title }}
      </h2>
      <ContentRenderer
        class="mt-8 mb-4 dark:bg-gray-800 dark:text-blue-200 text-justify"
        :value="intro"
      />
    </template>
    <p v-else>No content found.</p>
  </div>
</template>

<script setup>
const { data: intro } = await useAsyncData('intro', () =>
  queryCollection('author')
    .where('stem', '=', 'author/intro')
    .first(),
)
</script>
