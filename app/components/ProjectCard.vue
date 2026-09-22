<template>
  <div
    class="relative p-4 md:w-1/2"
    style="max-width: 544px"
  >
    <div
      ref="detailsTrigger"
      class="h-full overflow-hidden border-2 border-gray-200 rounded-xl dark:border-gray-700 bg-white dark:bg-gray-800"
      :class="{ 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-400': details }"
      :role="details ? 'button' : undefined"
      :tabindex="details ? 0 : undefined"
      :aria-haspopup="details ? 'dialog' : undefined"
      :aria-controls="details ? detailsId : undefined"
      @click="onCardClick"
      @keydown.enter.self.prevent="openDetails"
      @keydown.space.self.prevent="openDetails"
    >
      <div class="p-6">
        <div class="flex flex-row justify-between items-start">
          <div class="my-1">
            <FolderIcon class="w-9 h-9 text-indigo-700 dark:text-indigo-300" />
          </div>
          <div class="flex flex-row justify-between">
            <div
              v-if="projectHref"
              class="mx-1"
            >
              <a
                class="text-sm text-gray-500 transition hover:text-gray-600"
                target="_blank"
                rel="noopener noreferrer"
                :href="projectHref"
              >
                <span class="sr-only">external link</span>
                <ExternalIcon class="w-6 h-6 text-black dark:text-gray-200" />
              </a>
            </div>
            <div
              v-if="projectGithub"
              class="mx-1"
            >
              <a
                class="text-sm text-gray-500 transition hover:text-gray-600"
                target="_blank"
                rel="noopener noreferrer"
                :href="projectGithub"
              >
                <span class="sr-only">github</span>
                <GithubIcon class="w-6 h-6 text-black dark:text-gray-200" />
              </a>
            </div>
          </div>
        </div>

        <div
          v-if="projectPeriod"
          class="mt-2 text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-300"
        >
          {{ projectPeriod }}
        </div>
        <h2 class="text-xl font-bold leading-8 tracking-tight mt-1 mb-1 text-gray-900 dark:text-gray-100">
          {{ projectTitle }}
          <span
            v-if="highlight"
            class="block mt-1 mb-2 text-sm leading-6 font-semibold"
          >
            <span
              class="inline-block max-w-full rounded-md border px-2 py-0.5 align-middle"
              :class="highlight.type === 'certification'
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-300'"
            >{{ highlight.text }}</span>
          </span>
        </h2>
        <div
          v-if="projectRole"
          class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3"
        >
          {{ projectRole }}
        </div>
        <p class="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-4">
          {{ projectDescription }}
        </p>

        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tech in technologies"
            :key="tech"
            class="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-300"
          >
            {{ tech }}
          </span>
        </div>
      </div>
    </div>
    <dialog
      v-if="details"
      :id="detailsId"
      ref="detailsDialog"
      class="project-details-modal fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl border border-indigo-200 bg-white p-0 text-gray-700 shadow-xl backdrop:bg-black/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      :aria-labelledby="`${detailsId}-title`"
      @click="onDialogClick"
      @close="restoreFocus"
    >
      <div class="p-6 sm:p-8">
        <div class="flex items-start justify-between gap-3">
          <h3 :id="`${detailsId}-title`" class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ projectTitle }}</h3>
          <button type="button" class="shrink-0 cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" @click="closeDetails">닫기</button>
        </div>
        <h4 class="mt-4 font-semibold text-indigo-600 dark:text-indigo-300">{{ details.heading }}</h4>
        <p v-for="paragraph in details.paragraphs" :key="paragraph" class="mt-3 text-sm leading-7">
          {{ paragraph }}
        </p>
        <section v-for="section in details.sections" :key="section.heading" class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h4 class="font-semibold text-indigo-600 dark:text-indigo-300">{{ section.heading }}</h4>
          <p v-for="paragraph in section.paragraphs" :key="paragraph" class="mt-3 text-sm leading-7">
            {{ paragraph }}
          </p>
          <ul v-if="section.points?.length" class="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 marker:text-indigo-500">
            <li v-for="point in section.points" :key="point">{{ point }}</li>
          </ul>
          <figure v-for="image in section.images" :key="image.src" class="mt-5 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <a :href="`${assetBase}${image.src}`" target="_blank" rel="noopener noreferrer" :aria-label="`${image.alt} 원본 보기 (새 탭)`" class="block cursor-zoom-in bg-white p-2">
              <img :src="`${assetBase}${image.src}`" :alt="image.alt" loading="lazy" decoding="async" class="h-auto w-full" :class="{ 'max-h-[32rem] object-contain': image.portrait }">
            </a>
            <figcaption class="border-t border-gray-200 px-4 py-3 text-xs leading-6 text-gray-500 dark:border-gray-700 dark:text-gray-400">{{ image.caption }}</figcaption>
          </figure>
        </section>
      </div>
    </dialog>
  </div>
</template>

<script>
import FolderIcon from "~/assets/icons/folder.svg?component"
import ExternalIcon from "~/assets/icons/external.svg?component"
import GithubIcon from "~/assets/icons/github_new.svg?component"

export default {
  components: { FolderIcon, ExternalIcon, GithubIcon },
  props: ["title", "highlight", "description", "details", "href", "github", "tech1", "tech2", "tech3", "period", "role"],
  setup() {
    return { detailsId: useId(), assetBase: useRuntimeConfig().app.baseURL }
  },
  methods: {
    onCardClick(event) {
      if (!this.details || event.target.closest('a, button')) return
      this.openDetails()
    },
    openDetails() {
      this.$refs.detailsDialog?.showModal()
    },
    onDialogClick(event) {
      if (event.target !== this.$refs.detailsDialog) return
      const rect = this.$refs.detailsDialog.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.closeDetails()
    },
    closeDetails() {
      this.$refs.detailsDialog?.close()
    },
    restoreFocus() {
      this.$refs.detailsTrigger?.focus()
    },
  },
  computed: {
    projectTitle(){ return this.title },
    projectDescription(){ return this.description },
    projectHref(){ return this.href },
    projectGithub(){ return this.github },
    projectPeriod(){ return this.period },
    projectRole(){ return this.role },
    technologies(){
      return [this.tech1, this.tech2, this.tech3].filter(Boolean)
    },
  },
}
</script>

<style>
html:has(.project-details-modal[open]) {
  overflow: hidden;
}
</style>
