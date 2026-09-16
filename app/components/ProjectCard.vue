<template>
  <div
    class="p-4 md:w-1/2"
    style="max-width: 544px"
  >
    <div class="h-full overflow-hidden border-2 border-gray-200 rounded-xl dark:border-gray-700 bg-white dark:bg-gray-800">
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
  </div>
</template>

<script>
import FolderIcon from "~/assets/icons/folder.svg?component"
import ExternalIcon from "~/assets/icons/external.svg?component"
import GithubIcon from "~/assets/icons/github_new.svg?component"

export default {
  components: { FolderIcon, ExternalIcon, GithubIcon },
  props: ["title", "description", "href", "github", "tech1", "tech2", "tech3", "period", "role"],
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
