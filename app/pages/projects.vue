<template>
  <div class="max-w-3xl px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
    <div class="pt-6 pb-8 space-y-2 md:space-y-5">
      <h1
        class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14"
      >
        Projects
      </h1>
      <p class="text-lg leading-7 text-gray-500 dark:text-gray-400">
        엔터프라이즈, 창업, AI SaaS까지 직접 설계·개발·운영했던 주요 프로젝트와
        역할을 정리합니다.
      </p>
    </div>
    <main class="relative mb-auto">
      <div class="">
        <div class="container py-12">
          <div class="flex flex-wrap -m-4">
            <project-card
              v-for="item in projectsData"
              :key="item.title"
              :title="item.title"
              :highlight="item.highlight"
              :description="item.description"
              :period="item.period"
              :role="item.role"
              :href="item.href"
              :github="item.github"
              :tech1="item.tech1"
              :tech2="item.tech2"
              :tech3="item.tech3"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import projectsData from "@/data/projects";
import siteMetaInfo from "@/data/sitemetainfo.js";

const runtimeConfig = useRuntimeConfig();
useHead({
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: `${runtimeConfig.app.baseURL}favicon.ico`,
    },
  ],
});

useSeoMeta({
  title: `${siteMetaInfo.title} | Projects`,
  description: "유재민의 주요 개발 프로젝트와 기술 경험",
});
</script>
