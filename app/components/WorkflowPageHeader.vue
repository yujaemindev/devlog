<template>
  <header class="pt-8 pb-4 md:pt-12">
    <p class="mb-3 text-sm font-semibold tracking-widest text-indigo-600">
      {{ category }} / {{ label }}
    </p>
    <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
      {{ title }}
    </h1>
    <p class="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
      <slot />
    </p>
  </header>
</template>

<script setup>
defineProps({
  category: { type: String, default: 'WORKFLOW' },
  label: { type: String, required: true },
  title: { type: String, required: true },
});
</script>
