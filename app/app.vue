<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
</template>

<script setup>
const reducedMotion = ref(false);
const pageTransition = computed(() => ({
  name: 'page',
  mode: 'out-in',
  duration: reducedMotion.value ? 0 : { enter: 220, leave: 120 },
}));

let motionPreference;
const updateMotionPreference = () => {
  reducedMotion.value = motionPreference.matches;
};

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  updateMotionPreference();
  motionPreference.addEventListener('change', updateMotionPreference);
});

onBeforeUnmount(() => {
  motionPreference?.removeEventListener('change', updateMotionPreference);
});
</script>
