<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      category="EXPERIENCE"
      label="HTTPS CERTIFICATE"
      title="HTTPS 인증서 갱신과 서비스 적용 절차"
    >
      Windows에서 인증서 발급 도구인 win-acme를 사용해 도메인 소유권을 확인하고,
      Nginx 웹서버에 사용할 인증서를 준비한 운영 경험입니다. DNS 반영 지연과
      기존 인증서 캐시를 확인했던 기록을 바탕으로, 인증서 준비부터 서비스 적용
      확인까지의 절차를 정리했습니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="HTTPS 인증서 갱신 절차"
      @offset-change="sectionOffset = $event"
    />
    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/experience/https"
      >
        <div v-if="step.commands?.length" class="mt-6 space-y-4 sm:ml-14">
          <figure
            v-for="command in step.commands"
            :key="command.title"
            class="min-w-0 overflow-hidden rounded-xl border border-gray-200"
          >
            <figcaption
              class="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
            >
              {{ command.title }}
            </figcaption>
            <pre
              class="overflow-x-auto bg-gray-900 p-4 text-sm leading-7 text-gray-100"
            ><code>{{ command.code }}</code></pre>
          </figure>
        </div>
      </WorkflowSection>
    </div>
    <div class="mt-6 text-sm leading-7 text-gray-500">
      <p>
        win-acme 2.2.9 실행 기록 기준입니다. 도메인과 경로는 예시로 바꾸었으며,
        메뉴 번호는 버전에 따라 달라질 수 있습니다.
      </p>
      <p>
        참고 문서:
        <a
          class="text-indigo-600 underline"
          href="https://www.win-acme.com/reference/plugins/validation/dns/manual"
          target="_blank"
          rel="noopener noreferrer"
          >수동 DNS 인증</a
        >
        ·
        <a
          class="text-indigo-600 underline"
          href="https://www.win-acme.com/reference/plugins/store/pemfiles"
          target="_blank"
          rel="noopener noreferrer"
          >PEM 파일 구성</a
        >
        ·
        <a
          class="text-indigo-600 underline"
          href="https://nginx.org/en/docs/switches.html"
          target="_blank"
          rel="noopener noreferrer"
          >Nginx 실행 명령</a
        >
      </p>
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";
import { steps } from "@/data/https.js";

const sectionOffset = ref(171);
useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · HTTPS Certificate`,
  description:
    "Windows와 Nginx 환경의 HTTPS 인증서 갱신 경험: win-acme 설정, DNS 소유권 검증, TXT 반영 지연 확인, PEM 저장과 서비스 적용 절차",
});
</script>
