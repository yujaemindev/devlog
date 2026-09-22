<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      label="CI/CD"
      title="빌드부터 배포·검증·업무보고까지 자동화"
    >
      Jenkins를 중심으로 서비스 빌드·배포, 보안 검사, Jira 업무보고서 생성을
      자동화했습니다.<br />
      GitHub의 코드 변경을 확인하고 Docker 컨테이너를 배포하며, 실행 결과와
      산출물을 Slack으로 공유하는 과정을 정리했습니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="CI/CD 자동화 과정"
      @offset-change="sectionOffset = $event"
    />

    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/workflow/cicd"
      >
        <template #point-extra="{ index: pointIndex }">
          <a
            v-if="step.id === 'verify' && pointIndex === step.points.length - 1"
            :href="securityReportUrl"
            download="security-report.xlsx"
            class="ml-1 text-indigo-600 underline underline-offset-4 hover:text-indigo-800"
            >(샘플 파일 다운로드)</a
          >
        </template>
        <div
          v-if="step.table"
          class="mt-6 overflow-x-auto rounded-2xl border border-gray-200"
        >
          <table class="w-full text-left text-sm leading-7">
            <caption
              class="bg-gray-50 px-5 py-3 text-left font-semibold text-gray-900"
            >
              {{
                step.table.caption
              }}
            </caption>
            <thead class="border-y border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th scope="col" class="px-5 py-3">{{ step.table.label }}</th>
                <th scope="col" class="px-5 py-3">역할과 처리 내용</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-600">
              <tr v-for="row in step.table.rows" :key="row[0]">
                <th
                  scope="row"
                  class="px-5 py-3 align-top font-medium break-words"
                >
                  {{ row[0] }}
                </th>
                <td class="min-w-56 px-5 py-3 align-top">{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </WorkflowSection>
    </div>

    <WorkflowAside title="반복 작업을 자동화하고 결과를 팀의 확인 근거로 남깁니다">
      빌드, 배포, 보안 검증, 업무보고를 목적별 Jenkins 작업으로 구성해 반복되는
      실행 절차를 정리했습니다. 브랜치와 커밋에 연결된 빌드 결과, 서비스별 배포
      이력, 보안 검토용 보고서와 Jira 업무 현황을 기록하고 Slack과 이메일로
      공유합니다. 작업 실행부터 결과 확인과 산출물 전달까지 연결해, 팀이 변경
      내역과 후속 조치가 필요한 항목을 함께 살펴볼 수 있도록 했습니다.
    </WorkflowAside>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";
import { steps } from "@/data/cicd.js";

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const securityReportUrl = `${runtimeConfig.app.baseURL}images/workflow/cicd/security-report.xlsx`;
useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · CI/CD`,
  description:
    "Jenkins와 GitHub를 연결한 서비스 빌드, Docker 배포, SBOM·취약점 검사 및 Jira 업무보고서 자동화 경험",
});
</script>
