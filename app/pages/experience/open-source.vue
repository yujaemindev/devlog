<template>
  <main class="mx-auto max-w-5xl px-4 py-8 pb-16 sm:px-6 xl:px-0">
    <h1 class="sr-only">Open Source</h1>
    <div class="space-y-6">
      <a
        v-for="screen in screens"
        :key="screen.file"
        :href="asset(screen.file)"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${screen.alt} 원본 보기 (새 탭)`"
        class="block overflow-hidden rounded-2xl border border-gray-200 bg-white focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <img
          :src="asset(screen.file)"
          :alt="screen.alt"
          :width="1920"
          :height="screen.height || 953"
          loading="lazy"
          decoding="async"
          class="h-auto w-full"
        >
      </a>
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const runtimeConfig = useRuntimeConfig();
const asset = (file) => `${runtimeConfig.app.baseURL}images/experience/opensource-cvat/${file}`;

useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · Open Source`,
  description: "CVAT 기반 오픈소스 활용 화면",
});

const screens = [
  { file: "1_register-labeling.png", alt: "라벨링 등록 화면" },
  { file: "2_deeplabel-login.png", alt: "DeepLabel 로그인 화면" },
  { file: "3_deeplabel-project-list.png", alt: "DeepLabel 프로젝트 목록" },
  { file: "4_deeplabel-project-details.png", alt: "DeepLabel 프로젝트 상세" },
  { file: "5_deeplabel-task-selection-member-capture-date.png", alt: "부재·촬영일자별 태스크 선택" },
  { file: "6_deeplabel-job-selection-member-capture-date-worker-id.png", alt: "부재·촬영일자·작업자별 잡 선택" },
  { file: "7_deeplabel-job-details-export-menu.png", alt: "잡 상세의 Export 메뉴" },
  { file: "8_deeplabel-job-details-export-dropdown.png", alt: "Export 메뉴 선택 목록", height: 1080 },
  { file: "9_deeplabel-job-details-ok-button.png", alt: "잡 상세의 Export 확인 버튼" },
];
</script>
