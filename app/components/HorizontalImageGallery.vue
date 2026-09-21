<template>
  <div class="image-gallery min-w-0">
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="text-sm text-gray-500">좌우로 넘겨 화면을 확인하세요.</p>
      <div class="flex shrink-0 gap-2 min-[512px]:hidden">
        <button type="button" class="gallery-button" aria-label="이전 이미지" @click="move(-1)">←</button>
        <button type="button" class="gallery-button" aria-label="다음 이미지" @click="move(1)">→</button>
      </div>
    </div>
    <div class="relative">
      <button
        type="button"
        class="gallery-button gallery-floating-button left-2 hidden min-[512px]:flex"
        aria-label="이전 이미지"
        @click="move(-1)"
      >←</button>
      <button
        type="button"
        class="gallery-button gallery-floating-button right-2 hidden min-[512px]:flex"
        aria-label="다음 이미지"
        @click="move(1)"
      >→</button>
    <div
      ref="track"
      role="region"
      :aria-label="label"
      tabindex="0"
      class="gallery-track flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-2 focus-visible:outline-indigo-600"
      @keydown.left.self.prevent="move(-1)"
      @keydown.right.self.prevent="move(1)"
    >
      <figure
        v-for="(image, index) in images"
        :key="image.image"
        class="gallery-slide min-w-0 shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
        :class="{ 'gallery-slide-wide': image.width > image.height }"
        :style="{ '--image-ratio': image.width / image.height }"
      >
        <a
          :href="asset(image.image)"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${image.alt} 원본 보기 (새 탭)`"
          class="block p-3"
        >
          <img
            :src="asset(image.image)"
            :alt="image.alt"
            :width="image.width"
            :height="image.height"
            loading="lazy"
            decoding="async"
            class="gallery-image w-full rounded-lg object-contain"
          >
        </a>
        <figcaption class="border-t border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-600">
          <span class="mr-2 font-semibold text-indigo-600">{{ index + 1 }} / {{ images.length }}</span>
          {{ image.caption }}
        </figcaption>
      </figure>
    </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  images: { type: Array, required: true },
  imageDirectory: { type: String, required: true },
  label: { type: String, required: true },
});
const track = ref(null);
const runtimeConfig = useRuntimeConfig();
const asset = name => `${runtimeConfig.app.baseURL}${props.imageDirectory}/${name}`;

const move = (direction) => {
  const element = track.value;
  if (!element) return;
  const slides = Array.from(element.children);
  const left = element.getBoundingClientRect().left;
  const positions = slides.map(slide => slide.getBoundingClientRect().left - left + element.scrollLeft);
  const target = direction > 0
    ? positions.find(position => position > element.scrollLeft + 2)
    : positions.filter(position => position < element.scrollLeft - 2).pop();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollTo({
    left: target ?? (direction > 0 ? element.scrollWidth : 0),
    behavior: reducedMotion ? 'instant' : 'smooth',
  });
};
</script>

<style scoped>
.image-gallery {
  --gallery-image-height: clamp(320px, 55vh, 520px);
}
.gallery-button {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid var(--color-gray-200);
  border-radius: 9999px;
  color: var(--color-indigo-600);
  cursor: pointer;
}
.gallery-button:hover { background: var(--color-indigo-50); }
.gallery-floating-button {
  position: absolute;
  top: calc(var(--gallery-image-height) / 2 + 0.75rem + 1px);
  z-index: 10;
  transform: translateY(-50%);
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 4px 14px rgb(0 0 0 / 18%);
}
.gallery-track { scrollbar-color: var(--color-indigo-300) var(--color-gray-100); }
.gallery-slide {
  width: 88%;
}
.gallery-image { height: var(--gallery-image-height); }
@media (min-width: 640px) {
  .gallery-slide { width: 320px; }
}
.gallery-slide-wide {
  width: calc(var(--gallery-image-height) * var(--image-ratio) + 1.5rem + 2px);
}
</style>
