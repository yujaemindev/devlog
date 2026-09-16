<template>
  <section class="w-full px-6 pb-12 antialiased bg-white dark:bg-gray-900">
    <div class="mx-auto max-w-8xl">
      <TheHeader />
      <NuxtLoadingIndicator />
      <slot />
      <TheFooter />
    </div>
  </section>
</template>
