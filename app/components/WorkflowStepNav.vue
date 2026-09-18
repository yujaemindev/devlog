<template>
  <nav
    ref="stepNav"
    :aria-label="label"
    class="workflow-step-nav sticky z-40 mb-8 flex flex-wrap gap-2 border-b border-gray-100 bg-white py-3"
    :style="{ top: `${headerHeight}px` }"
  >
    <a
      v-for="(step, index) in steps"
      :key="step.id"
      :href="`#${step.id}`"
      class="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
    >
      {{ String(index + 1).padStart(2, '0') }} · {{ step.label }}
    </a>
  </nav>
</template>

<script setup>
defineProps({
  steps: { type: Array, required: true },
  label: { type: String, required: true },
});

const emit = defineEmits(['offset-change']);
const headerHeight = useState('site-header-height', () => 89);
const stepNav = ref(null);
const stepNavHeight = ref(66);
let observer;

watch(
  [headerHeight, stepNavHeight],
  ([header, nav]) => emit('offset-change', header + nav + 16),
  { immediate: true },
);

onMounted(() => {
  const updateHeight = () => {
    stepNavHeight.value = stepNav.value.getBoundingClientRect().height;
  };
  updateHeight();
  observer = new ResizeObserver(updateHeight);
  observer.observe(stepNav.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style>
@media (prefers-reduced-motion: no-preference) {
  html:has(.workflow-step-nav) {
    scroll-behavior: smooth;
  }
}
</style>
