<template>
  <div
    ref="navSlot"
    class="step-nav-slot sticky z-40 mb-8"
    :class="{ 'is-compact': isCompact }"
    :style="{ '--nav-height': `${stepNavHeight}px` }"
  >
    <nav
      ref="stepNav"
      :aria-label="label"
      class="workflow-step-nav flex flex-wrap gap-2 border-b border-gray-100 bg-white py-3"
    >
      <a
        v-for="(step, index) in steps"
        :key="step.id"
        :href="`#${step.id}`"
        :aria-label="`${String(index + 1).padStart(2, '0')} · ${step.label}`"
        :title="step.label"
        :aria-current="activeStep === step.id ? 'location' : undefined"
        :class="activeStep === step.id
          ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
          : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'"
        class="step-link rounded-full border px-4 py-2 text-sm font-medium"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="step-label"> · {{ step.label }}</span>
      </a>
    </nav>
  </div>
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
const navSlot = ref(null);
const collapseTarget = computed(() => props.collapseAfter || props.steps[0]?.id);
const stepNavHeight = ref(66);
let observer;
const isCompact = ref(false);
const activeStep = ref(null);
let previousHeadingBottom = null;
let scrollTravel = 0;
let frame = 0;

const updateCompact = () => {
  frame = 0;
  updatePosition();
  updateActiveStep();
  if (!collapseTarget.value || !window.matchMedia('(width < 48rem)').matches) {
    isCompact.value = false;
    previousHeadingBottom = null;
    scrollTravel = 0;
    return;
  }
  const heading = document.getElementById(collapseTarget.value)?.querySelector('h2');
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

const updatePosition = () => {
  if (!navSlot.value) return;
  const rect = navSlot.value.getBoundingClientRect();
  navSlot.value.style.setProperty('--nav-left', `${rect.left}px`);
  navSlot.value.style.setProperty('--nav-width', `${rect.width}px`);
};

const updateActiveStep = () => {
  if (!stepNav.value) return;
  const contentTop = Math.max(headerHeight.value, stepNav.value.getBoundingClientRect().bottom);
  const viewportBottom = window.innerHeight;
  const readingLine = contentTop + Math.max(0, viewportBottom - contentTop) * 0.25;
  const visibleSections = props.steps.flatMap((step) => {
    const section = document.getElementById(step.id);
    if (!section) return [];
    const rect = section.getBoundingClientRect();
    return rect.bottom > contentTop && rect.top < viewportBottom
      ? [{ id: step.id, top: rect.top }]
      : [];
  });
  // Prefer the section being read near the top of the unobscured content area.
  activeStep.value = visibleSections.filter(section => section.top <= readingLine).pop()?.id
    ?? visibleSections[0]?.id
    ?? null;
};

watch(
  [headerHeight, stepNavHeight],
  ([header, nav]) => {
    emit('offset-change', header + nav + 16);
    if (navSlot.value) scheduleUpdate();
  },
  { immediate: true },
);

onMounted(() => {
  const updateHeight = () => {
    stepNavHeight.value = stepNav.value.getBoundingClientRect().height;
    updatePosition();
    scheduleUpdate();
  };
  updateHeight();
  observer = new ResizeObserver(updateHeight);
  observer.observe(stepNav.value);
  observer.observe(navSlot.value);
  props.steps.forEach((step) => {
    const section = document.getElementById(step.id);
    if (section) observer.observe(section);
  });
  scheduleUpdate();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
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
.step-nav-slot {
  top: calc(var(--site-header-height, 89px) - 1px);
}

.step-link {
  transition: padding 220ms ease, font-size 220ms ease,
    background-color 180ms ease, border-color 180ms ease, color 180ms ease;
}

@media (width < 48rem) {
  .step-nav-slot.is-compact {
    height: var(--nav-height);
  }

  .is-compact .workflow-step-nav {
    position: fixed;
    top: calc(var(--site-header-height, 89px) - 1px);
    left: var(--nav-left);
    width: var(--nav-width);
    flex-wrap: nowrap;
    gap: 2px;
    padding-block: 6px;
  }

  .is-compact .step-link > span:first-child {
    animation: number-appear 180ms ease-out;
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

@keyframes number-appear {
  from { opacity: 0.5; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .step-link {
    transition: none;
  }

  .is-compact .step-link > span:first-child {
    animation: none;
  }
}
</style>
