<template>
  <nav
    ref="stepNav"
    :aria-label="label"
    :class="{ 'is-compact': isCompact }"
    class="workflow-step-nav sticky z-40 mb-8 flex flex-wrap gap-2 border-b border-gray-100 bg-white py-3"
    :style="{ top: `${headerHeight}px` }"
  >
    <a
      v-for="(step, index) in steps"
      :key="step.id"
      :href="`#${step.id}`"
      :aria-label="`${String(index + 1).padStart(2, '0')} · ${step.label}`"
      :title="step.label"
      class="step-link rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
    >
      <span>{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="step-label"> · {{ step.label }}</span>
    </a>
  </nav>
</template>

<script setup>
const props = defineProps({
  steps: { type: Array, required: true },
  label: { type: String, required: true },
  collapseAfter: { type: String, default: '' },
});

const emit = defineEmits(['offset-change']);
const headerHeight = useState('site-header-height', () => 89);
const stepNav = ref(null);
const stepNavHeight = ref(66);
let observer;
const isCompact = ref(false);
let previousHeadingBottom = null;
let scrollTravel = 0;
let frame = 0;

const updateCompact = () => {
  frame = 0;
  if (!props.collapseAfter || !window.matchMedia('(width < 48rem)').matches) {
    isCompact.value = false;
    previousHeadingBottom = null;
    scrollTravel = 0;
    return;
  }
  const heading = document.getElementById(props.collapseAfter)?.querySelector('h2');
  if (!heading || !stepNav.value) return;
  const navRect = stepNav.value.getBoundingClientRect();
  const headingBottom = heading.getBoundingClientRect().bottom;
  if (previousHeadingBottom === null) {
    previousHeadingBottom = headingBottom;
    isCompact.value = window.scrollY > 0 && headingBottom <= navRect.bottom;
    return;
  }

  // Viewport movement excludes scroll anchoring that moves scrollY along with layout.
  const movement = previousHeadingBottom - headingBottom;
  previousHeadingBottom = headingBottom;
  if (movement !== 0) {
    scrollTravel = Math.sign(movement) === Math.sign(scrollTravel)
      ? scrollTravel + movement
      : movement;
  }

  // Require deliberate movement in the opposite direction before changing state.
  if (window.scrollY <= 0 || (isCompact.value && scrollTravel <= -16)) {
    isCompact.value = false;
    scrollTravel = 0;
  } else if (!isCompact.value && scrollTravel >= 16 && headingBottom <= navRect.bottom) {
    isCompact.value = true;
    scrollTravel = 0;
  }
};

const scheduleUpdate = () => {
  if (!frame) frame = requestAnimationFrame(updateCompact);
};

watch(
  [headerHeight, stepNavHeight],
  ([header, nav]) => emit('offset-change', header + nav + 16),
  { immediate: true },
);

onMounted(() => {
  const updateHeight = () => {
    stepNavHeight.value = stepNav.value.getBoundingClientRect().height;
    if (props.collapseAfter) scheduleUpdate();
  };
  updateHeight();
  observer = new ResizeObserver(updateHeight);
  observer.observe(stepNav.value);
  if (props.collapseAfter) {
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener('scroll', scheduleUpdate);
  window.removeEventListener('resize', scheduleUpdate);
  cancelAnimationFrame(frame);
});
</script>

<style>
@media (prefers-reduced-motion: no-preference) {
  html:has(.workflow-step-nav) {
    scroll-behavior: smooth;
  }
}
</style>

<style scoped>
@media (width < 48rem) {
  .step-link {
    transition: padding 220ms ease, font-size 220ms ease;
  }

  .workflow-step-nav.is-compact {
    flex-wrap: nowrap;
    gap: 2px;
    padding-block: 6px;
  }

  .is-compact .step-link {
    display: flex;
    flex: 1 1 0;
    min-width: 0;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    padding: 6px 0;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .is-compact .step-label {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-link {
    transition: none;
  }
}
</style>
