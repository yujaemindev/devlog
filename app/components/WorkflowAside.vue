<template>
  <aside class="mt-14 border-t border-gray-200 pt-8">
    <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
    <p class="mt-3 leading-8 text-gray-600">
      <slot />
    </p>
  </aside>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
});
</script>
