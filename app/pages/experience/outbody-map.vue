<template>
  <main class="mx-auto max-w-5xl px-4 pt-8 pb-12 sm:px-6 xl:px-0">
    <h1 class="sr-only">
      OUTBODY MAP
    </h1>
    <iframe
      :src="demoUrl"
      title="OUTBODY MAP"
      allow="fullscreen"
      class="h-[calc(100vh-8rem)] min-h-[640px] w-full rounded-2xl border border-gray-200 bg-gray-950"
    />
  </main>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig();
const demoUrl = `${runtimeConfig.app.baseURL}demos/outbody-map/index.html`;
</script>
