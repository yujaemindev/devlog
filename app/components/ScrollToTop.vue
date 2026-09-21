<template>
  <Transition name="scroll-top">
    <button
      v-if="visible"
      type="button"
      class="scroll-top-button fixed z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
      aria-label="맨 위로 이동"
      title="맨 위로 이동"
      @click="scrollToTop"
    >
      <svg
        class="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 12 6-6 6 6M12 6v12" />
      </svg>
    </button>
  </Transition>
</template>

<script setup>
const visible = ref(false);

const updateVisibility = () => {
  visible.value = window.scrollY > 240;
};

const scrollToTop = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
};

onMounted(() => {
  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisibility);
});
</script>

<style scoped>
.scroll-top-button {
  right: calc(1rem + env(safe-area-inset-right, 0px));
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  transition: background-color 180ms ease;
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .scroll-top-button {
    transition: none;
  }
}
</style>
