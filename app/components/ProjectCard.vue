<template>
  <div
    class="relative p-4 md:w-1/2"
    style="max-width: 544px"
  >
    <div
      ref="detailsTrigger"
      class="project-card-surface relative h-full overflow-hidden border-2 border-gray-200 rounded-xl dark:border-gray-700 bg-white dark:bg-gray-800"
      :class="{ 'project-card-actionable cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-400': actionLabel }"
      :role="to ? 'link' : details ? 'button' : href ? 'link' : undefined"
      :tabindex="actionLabel ? 0 : undefined"
      :aria-label="actionLabel ? `${projectTitle} ${actionLabel}` : undefined"
      :aria-haspopup="!to && details ? 'dialog' : undefined"
      :aria-controls="!to && details ? detailsId : undefined"
      @click="onCardClick"
      @keydown.enter.self.prevent="activateCard"
      @keydown.space.self.prevent="activateCard"
    >
      <div class="project-card-content p-6">
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
      <div
        v-if="actionLabel"
        aria-hidden="true"
        class="project-card-action pointer-events-none absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-gray-900/30"
      >
        <span class="rounded-lg border border-indigo-200 bg-white/95 px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-600 dark:bg-gray-800/95 dark:text-indigo-200">
          {{ actionLabel }}
        </span>
      </div>
    </div>
    <dialog
      v-if="details && !to"
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
        <HorizontalImageGallery
          v-if="details.gallery?.images?.length"
          class="project-overview-gallery mt-5"
          :images="details.gallery.images"
          :image-directory="details.gallery.imageDirectory"
          :label="details.gallery.label"
        />
        <section v-for="section in details.sections" :key="section.heading" class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h4 class="font-semibold text-indigo-600 dark:text-indigo-300">{{ section.heading }}</h4>
          <p v-for="paragraph in section.paragraphs" :key="paragraph" class="mt-3 text-sm leading-7">
            {{ paragraph }}
          </p>
          <HorizontalImageGallery
            v-if="section.gallery?.images?.length"
            class="project-overview-gallery mt-5"
            :images="section.gallery.images"
            :image-directory="section.gallery.imageDirectory"
            :label="section.gallery.label"
          />
          <div v-if="section.incidents?.length" class="mt-5 max-h-[15rem] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700" tabindex="0" role="region" :aria-label="`${section.heading} 사고 사례 표 (스크롤하여 전체 보기)`">
            <table class="w-full border-collapse text-left text-sm leading-6">
              <caption class="sr-only">시설물 사고 사례와 조사 자료</caption>
              <thead class="sticky top-0 z-10 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                <tr>
                  <th scope="col" class="whitespace-nowrap px-3 py-3 font-semibold">발생</th>
                  <th scope="col" class="px-3 py-3 font-semibold">사고</th>
                  <th scope="col" class="whitespace-nowrap px-3 py-3 font-semibold">출처</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="incident in section.incidents" :key="incident.href" class="border-t border-gray-200 align-top dark:border-gray-700">
                  <td class="whitespace-nowrap px-3 py-4 text-xs">{{ incident.date }}</td>
                  <th scope="row" class="px-3 py-4 font-medium text-gray-900 dark:text-gray-100">{{ incident.name }}</th>
                  <td class="whitespace-nowrap px-3 py-4 text-xs">
                    <a :href="incident.href" target="_blank" rel="noopener noreferrer" :aria-label="`${incident.name} ${incident.source} 조사 자료 (새 탭)`" class="text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">{{ incident.source }}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="section.incidents?.length" class="mt-2 text-center text-xs leading-6 text-gray-500 dark:text-gray-400">최근 10년 주요 공공시설 안전사고</p>
          <ul v-if="section.points?.length" class="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 marker:text-indigo-500">
            <li v-for="point in section.points" :key="point">{{ point }}</li>
          </ul>
          <figure v-for="image in section.images" :key="image.src" class="mt-5 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <a :href="`${assetBase}${image.src}`" target="_blank" rel="noopener noreferrer" :aria-label="`${image.alt} 원본 보기 (새 탭)`" class="block cursor-zoom-in bg-white p-2">
              <img :src="`${assetBase}${image.src}`" :alt="image.alt" loading="lazy" decoding="async" class="h-auto w-full" :class="{ 'max-h-[32rem] object-contain': image.portrait }">
            </a>
            <figcaption class="border-t border-gray-200 px-4 py-3 text-xs leading-6 text-gray-500 dark:border-gray-700 dark:text-gray-400">{{ image.caption }}</figcaption>
          </figure>
          <div v-if="section.sources?.length" class="mt-5 border-t border-gray-200 pt-3 text-xs leading-6 dark:border-gray-700">
            <p class="font-medium text-gray-500 dark:text-gray-400">관련 조사 자료</p>
            <ul class="mt-1 space-y-1">
              <li v-for="source in section.sources" :key="source.href">
                <a :href="source.href" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">{{ source.label }}<span class="sr-only"> (새 탭)</span></a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </dialog>
  </div>
</template>

<script>
import FolderIcon from "~/assets/icons/folder.svg?component"
import ExternalIcon from "~/assets/icons/external.svg?component"
import GithubIcon from "~/assets/icons/github_new.svg?component"
import HorizontalImageGallery from "~/components/HorizontalImageGallery.vue"

export default {
  components: { FolderIcon, ExternalIcon, GithubIcon, HorizontalImageGallery },
  props: ["title", "highlight", "description", "details", "to", "href", "github", "tech1", "tech2", "tech3", "period", "role"],
  setup() {
    return { detailsId: useId(), assetBase: useRuntimeConfig().app.baseURL }
  },
  methods: {
    onCardClick(event) {
      if (event.target.closest('a, button')) return
      this.activateCard()
    },
    activateCard() {
      if (this.to) return navigateTo(this.to)
      if (this.details) return this.openDetails()
      if (this.href) return navigateTo(this.href, { external: true, open: { target: '_blank', windowFeatures: { noopener: true, noreferrer: true } } })
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
    actionLabel() { return this.to ? '페이지 이동' : this.details ? '상세 내용 보기' : this.href ? '새 페이지 열기' : '' },
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
.project-overview-gallery.image-gallery {
  --gallery-image-height: 320px;
}
.project-overview-gallery .gallery-slide {
  width: 100%;
  max-width: 100%;
}
.project-overview-gallery .gallery-image {
  height: var(--gallery-image-height);
  object-fit: contain;
}
.project-overview-gallery .gallery-floating-button {
  top: 50%;
}
.project-card-content {
  transition: filter 180ms ease;
}
.project-card-action {
  opacity: 0;
  transition: opacity 180ms ease;
}
.project-card-actionable:hover .project-card-content,
.project-card-actionable:focus-visible .project-card-content {
  filter: blur(2px);
}
.project-card-actionable:hover .project-card-action,
.project-card-actionable:focus-visible .project-card-action {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .project-card-content,
  .project-card-action {
    transition: none;
  }
}
html:has(.project-details-modal[open]) {
  overflow: hidden;
}
</style>
