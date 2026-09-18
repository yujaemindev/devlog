<template>
  <section :id="step.id" class="scroll-mt-[var(--section-offset)]">
    <div class="mb-5 flex items-start gap-4">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
        {{ String(number).padStart(2, '0') }}
      </span>
      <div>
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">
          {{ step.title }}
        </h2>
        <p class="mt-3 leading-7 text-gray-600">{{ step.description }}</p>
      </div>
    </div>
    <ul v-if="step.points?.length" class="mb-6 space-y-2 pl-5 text-gray-600 sm:ml-14">
      <li
        v-for="point in step.points"
        :key="point"
        class="list-disc leading-7 marker:text-indigo-400"
      >
        {{ point }}
      </li>
    </ul>
    <div
      v-if="step.images?.length"
      class="grid items-start gap-4"
      :class="{ 'md:grid-cols-[2fr_1fr]': step.images.length === 2 }"
    >
      <figure
        v-for="image in step.images"
        :key="image.image"
        class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
      >
        <a
          :href="asset(image.image)"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${image.label || step.label} 이미지 원본 보기 (새 탭)`"
          class="block p-3"
          :class="{ 'sm:p-5': step.images.length === 1 }"
        >
          <img
            :src="asset(image.image)"
            :alt="image.alt"
            :width="image.width"
            :height="image.height"
            loading="lazy"
            class="mx-auto h-auto w-full rounded-lg"
          >
        </a>
        <figcaption class="border-t border-gray-200 bg-white px-5 py-3 text-sm leading-6 text-gray-500">
          {{ image.caption }} · 이미지를 누르면 원본을 새 탭에서 볼 수 있습니다.
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  step: { type: Object, required: true },
  number: { type: Number, required: true },
  imageDirectory: { type: String, default: 'images/workflow' },
});

const runtimeConfig = useRuntimeConfig();
const asset = name => `${runtimeConfig.app.baseURL}${props.imageDirectory}/${name}`;
</script>
