<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader label="CI/CD" title="빌드부터 배포·검증·업무보고까지 자동화">
      Jenkins를 중심으로 서비스 빌드·배포, 보안 검사, Jira 업무보고서 생성을 자동화했습니다.<br>
      GitHub의 코드 변경을 확인하고 Docker 컨테이너를 배포하며, 실행 결과와 산출물을 Slack으로 공유하는 과정을 정리했습니다.
    </WorkflowPageHeader>
    <WorkflowStepNav :steps="steps" label="CI/CD 자동화 과정" @offset-change="sectionOffset = $event" />

    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/workflow/cicd"
      >
        <a
          v-if="step.id === 'verify'"
          :href="securityReportUrl"
          download="security-report.xlsx"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          보안 검증 보고서 다운로드 · XLSX <span aria-hidden="true">↓</span>
        </a>
        <div v-if="step.table" class="mt-6 overflow-x-auto rounded-2xl border border-gray-200">
          <table class="w-full text-left text-sm leading-7">
            <caption class="bg-gray-50 px-5 py-3 text-left font-semibold text-gray-900">{{ step.table.caption }}</caption>
            <thead class="border-y border-gray-200 bg-gray-50 text-gray-700">
              <tr><th scope="col" class="px-5 py-3">{{ step.table.label }}</th><th scope="col" class="px-5 py-3">역할과 처리 내용</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-600">
              <tr v-for="row in step.table.rows" :key="row[0]">
                <th scope="row" class="px-5 py-3 align-top font-medium break-words">{{ row[0] }}</th>
                <td class="min-w-56 px-5 py-3 align-top">{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="step.note" class="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm leading-7 text-gray-700">{{ step.note }}</p>
      </WorkflowSection>
    </div>

    <WorkflowAside title="저장소 설정과 첨부 화면을 기준으로 정리한 자동화 흐름">
      작업 순서는 저장소 설정을 기준으로 설명하며, 첨부 이미지는 촬영 시점의 설정과 실행 이력입니다.
      현재 Jenkins 서버의 실행 상태를 실시간으로 확인한 것은 아닙니다.
      jobs에는 6개 작업의 설정만 백업되어 있어, 저장소만으로 scripts 전체 작업의 등록 여부를 확인할 수는 없습니다.
    </WorkflowAside>
  </main>
</template>

<script setup>
import siteMetaInfo from '@/data/sitemetainfo.js';
import { steps } from '@/data/cicd.js';

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const securityReportUrl = `${runtimeConfig.app.baseURL}images/workflow/cicd/security-report.xlsx`;
useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · CI/CD`,
  description: 'Jenkins와 GitHub를 연결한 서비스 빌드, Docker 배포, SBOM·취약점 검사 및 Jira 업무보고서 자동화 경험',
});
</script>
