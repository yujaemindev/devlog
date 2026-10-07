<template>
  <button
    ref="trigger"
    type="button"
    class="min-h-11 rounded-lg px-3 text-sm text-gray-500 underline underline-offset-4 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-gray-400"
    aria-haspopup="dialog"
    @click="open"
  >
    사용한 라이브러리
  </button>
  <dialog
    ref="dialog"
    aria-labelledby="library-versions-title"
    aria-describedby="library-versions-description"
    class="library-dialog rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
    @click="closeOnBackdrop"
    @close="restoreFocus"
  >
    <div class="p-5 sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <h2 id="library-versions-title" class="text-xl font-semibold">사용한 라이브러리</h2>
        <button
          type="button"
          autofocus
          class="min-h-11 rounded-lg px-3 text-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:hover:bg-gray-800"
          @click="dialog.close()"
        >닫기</button>
      </div>
      <p id="library-versions-description" class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
        이 사이트에 사용한 라이브러리와 개발 도구의 버전입니다.
      </p>
      <section v-for="group in libraryVersions" :key="group.title" class="mt-6">
        <h3 class="mb-3 font-semibold">{{ group.title }}</h3>
        <dl class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="library in group.libraries" :key="library.name" class="flex items-start justify-between gap-4 py-3 text-sm">
            <dt class="min-w-0 break-all">{{ library.name }}</dt>
            <dd class="shrink-0 font-mono text-indigo-600 dark:text-indigo-300">{{ library.version }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </dialog>
</template>

<script setup>
const libraryVersions = useRuntimeConfig().public.libraryVersions;
const dialog = ref(null);
const trigger = ref(null);

const open = () => {
  if (!dialog.value?.open) dialog.value?.showModal();
};
const restoreFocus = () => trigger.value?.focus();
const closeOnBackdrop = (event) => {
  if (event.target !== dialog.value) return;
  const bounds = dialog.value.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    dialog.value.close();
  }
};
</script>

<style scoped>
.library-dialog {
  width: min(36rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  margin: auto;
  overscroll-behavior: contain;
}
.library-dialog::backdrop {
  background: rgb(0 0 0 / 50%);
}
</style>
