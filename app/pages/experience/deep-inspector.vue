<template>
  <main
    class="gs-experience mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader category="EXPERIENCE" label="GS인증" title="Standalone에서 SaaS로 · GS인증 대응">
      실행파일로 제공하던 교량 안전점검 소프트웨어의 기능을 개선하고 SaaS로 전환했습니다.
      웹서비스의 GS인증을 위해 신청서류와 시험환경을 준비하고, 결함 수정과 AI 성능 자체 검증 자료를 정리한 경험입니다.
    </WorkflowPageHeader>
    <WorkflowStepNav :steps="steps" label="GS인증 과정" @offset-change="sectionOffset = $event" />

    <div class="space-y-14">
      <WorkflowSection v-for="(step, index) in steps" :key="step.id" :step="step" :number="index + 1">
        <template v-if="step.id === 'gs-overview'">
          <a :href="ttaIntroduction" target="_blank" rel="noopener noreferrer" class="document-link">TTA 공식 GS인증 소개 · 시험 절차 ↗</a>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="info-card">
              <p class="eyebrow">이전 · Standalone</p>
              <h3 class="font-bold text-gray-900">Bridge Deep Inspector v2.1</h3>
              <p class="mt-2 text-sm leading-7 text-gray-600">PC에 설치한 실행파일로 사용하던 구버전입니다. GS-A-19-585는 2020년의 프로그램·문서·설치환경 결함 대응 기록입니다.</p>
            </div>
            <div class="info-card">
              <p class="eyebrow">이번 · 기능 개선 및 SaaS 전환</p>
              <h3 class="font-bold text-gray-900">XAI 기반 교량안전점검 자동화 소프트웨어 v3.0</h3>
              <p class="mt-2 text-sm leading-7 text-gray-600">브라우저에서 사용하는 SaaS로 전환하고 인증·사용 흐름·AI 결과 표시를 보완했습니다. 이번 시험의 GS-A-25-0255 리포트 v1~v3를 중심으로 대응 과정을 정리합니다.</p>
            </div>
          </div>
        </template>

        <ol v-else-if="step.id === 'gs-preparation'" class="space-y-5">
          <li class="info-card">
            <h3 class="font-bold text-gray-900">1. GS시험인증 수수료 납부</h3>
            <p class="mt-2 leading-7 text-gray-600">사전 상담 후 받은 견적서의 시험 범위와 납부 안내를 확인하고 수수료를 납부합니다.</p>
          </li>
          <li class="info-card">
            <h3 class="font-bold text-gray-900">2. GS인증 신청서류 5종 준비</h3>
            <ol class="mt-4 divide-y divide-gray-200">
              <li v-for="(document, documentIndex) in applicationDocuments" :key="document.title" class="py-4 first:pt-0 last:pb-0">
                <h4 class="font-semibold text-gray-900">{{ documentIndex + 1 }}. {{ document.title }}</h4>
                <p class="mt-1 text-sm leading-7 text-gray-600">{{ document.description }}</p>
                <a v-if="document.file" :href="asset(document.file)" target="_blank" rel="noopener noreferrer" class="document-link mt-2 inline-flex">{{ document.title }} PDF 보기 ↗</a>
              </li>
            </ol>
          </li>
          <li class="info-card">
            <h3 class="font-bold text-gray-900">3. TTA 홈페이지에서 GS시험 신청</h3>
            <p class="mt-2 leading-7 text-gray-600">준비한 서류로 시험을 신청하고, 담당자 배정 후 시작일과 서버·데이터·설치 환경을 협의합니다.</p>
            <a :href="ttaIntroduction" target="_blank" rel="noopener noreferrer" class="document-link mt-2 inline-flex">TTA 신청 절차 확인 ↗</a>
          </li>
        </ol>

        <div v-else-if="step.id === 'gs-consultation'" class="space-y-4">
          <article v-for="item in consultations" :key="item.title" class="info-card">
            <h3 class="text-lg font-bold text-gray-900">{{ item.title }}</h3>
            <dl class="mt-4 space-y-3 text-sm leading-7">
              <div><dt class="font-semibold text-gray-900">문의</dt><dd class="text-gray-600">{{ item.question }}</dd></div>
              <div><dt class="font-semibold text-indigo-600">담당자 답변</dt><dd class="text-gray-600">{{ item.answer }}</dd></div>
              <div><dt class="font-semibold text-gray-900">준비 사항</dt><dd class="text-gray-600">{{ item.action }}</dd></div>
            </dl>
          </article>
        </div>

        <div v-else-if="step.id === 'gs-defects'" class="space-y-6">
          <div class="grid gap-4 md:grid-cols-3">
            <article v-for="report in defectReports" :key="report.file" class="info-card flex flex-col">
            <p class="eyebrow">{{ report.date }}</p>
            <h3 class="text-lg font-bold text-gray-900">{{ report.title }}</h3>
            <p class="mt-2 text-sm font-semibold text-indigo-600">{{ report.count }}</p>
            <p class="my-3 text-sm leading-7 text-gray-600">{{ report.description }}</p>
              <a :href="asset(report.file)" download class="document-link mt-auto">이번 결함 리포트 XLSX 다운로드 ↓</a>
            </article>
          </div>
          <div>
            <h3 class="mb-4 text-lg font-bold text-gray-900">SaaS 전환 후 시험 대응에서 보완한 내용</h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <article v-for="item in saasImprovements" :key="item.title" class="info-card">
                <h4 class="font-bold text-gray-900">{{ item.title }}</h4>
                <p class="mt-2 text-sm leading-7 text-gray-600">{{ item.description }}</p>
                <p class="mt-3 text-xs text-indigo-600">{{ item.reference }} · 업체 응답 및 처리 상태 기준</p>
              </article>
            </div>
          </div>
          <details class="info-card">
            <summary class="cursor-pointer font-semibold text-gray-900">과거 standalone 버전 자료 · GS-A-19-585</summary>
            <div class="mt-4 grid gap-4 md:grid-cols-3">
              <article v-for="report in legacyDefectReports" :key="report.file" class="flex flex-col">
                <p class="eyebrow">{{ report.date }} · 과거 자료</p>
                <h4 class="font-bold text-gray-900">{{ report.title }}</h4>
                <p class="mt-2 text-sm text-indigo-600">{{ report.count }}</p>
                <p class="my-3 text-sm leading-7 text-gray-600">{{ report.description }}</p>
                <a :href="asset(report.file)" download class="document-link mt-auto">과거 리포트 XLS 다운로드 ↓</a>
              </article>
            </div>
          </details>
        </div>

        <div v-else-if="step.id === 'gs-ai-validation'">
          <div class="overflow-x-auto rounded-2xl border border-gray-200" role="region" aria-label="AI 자체시험 결과 표" tabindex="0">
            <table class="w-full min-w-[640px] text-left text-sm">
              <caption class="sr-only">AI 자체시험성적서 6종의 지표, 기준, 상세 결과와 검증 이미지 수</caption>
              <thead class="bg-gray-50 text-gray-700"><tr><th scope="col">시험 항목</th><th scope="col">평가 지표</th><th scope="col">기준</th><th scope="col">결과</th><th scope="col">검증 데이터</th><th scope="col">자료</th></tr></thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="report in aiReports" :key="report.file">
                  <th scope="row" class="text-gray-900">{{ report.title }}</th>
                  <td>{{ report.metric }}</td><td class="whitespace-nowrap">{{ report.target }}</td>
                  <td class="font-bold text-indigo-600">{{ report.result }}</td><td>{{ report.samples }}</td>
                  <td><a :href="asset(`ai/${report.file}`)" :aria-label="`${report.title} 자체시험성적서 PDF 보기 (새 탭)`" target="_blank" rel="noopener noreferrer" class="document-link whitespace-nowrap">PDF ↗</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <details class="info-card mt-4">
            <summary class="cursor-pointer font-semibold text-gray-900">원문 수치와 표기 확인 사항</summary>
            <ul class="mt-3 space-y-2 text-sm leading-7 text-gray-600">
              <li v-for="report in aiReports.filter(item => item.note)" :key="report.file"><strong>{{ report.title }}:</strong> {{ report.note }}</li>
            </ul>
          </details>
        </div>

        <div v-else-if="step.id === 'gs-summary'" class="info-card">
          <h3 class="font-bold text-gray-900">정리한 산출물</h3>
          <ul class="mt-3 list-disc space-y-2 pl-5 leading-7 text-gray-600">
            <li>신청서류와 제품·사용자 설명서</li>
            <li>시험 범위와 실행환경에 대한 사전 협의 내용</li>
            <li>이번 GS-A-25-0255 결함 리포트 v1~v3와 SaaS 기능 보완 기록</li>
            <li>AI 자체시험성적서 6종 및 과거 standalone 버전 결함 리포트 3개</li>
          </ul>
          <p class="mt-4 border-t border-gray-200 pt-4 text-sm leading-7 text-gray-500">이 페이지는 제공된 준비·시험 자료까지의 기록입니다. 최종 인증 여부, 등급과 취득일은 인증 결과가 확인된 후 별도로 정리합니다.</p>
        </div>
      </WorkflowSection>
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from '@/data/sitemetainfo.js';
import { steps, applicationDocuments, consultations, defectReports, legacyDefectReports, saasImprovements, aiReports, ttaIntroduction } from '@/data/gs-certification.js';

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const asset = path => `${runtimeConfig.app.baseURL}images/experience/gs/${path.split('/').map(encodeURIComponent).join('/')}`;

useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · GS인증`,
  description: 'Standalone 교량 안전점검 소프트웨어의 기능 개선과 SaaS 전환, GS-A-25-0255 결함 대응 및 AI 성능 자체 검증을 정리한 GS인증 경험',
});
</script>

<style scoped>
.info-card { border: 1px solid var(--color-gray-200); border-radius: 1rem; padding: 1.25rem; background: white; }
.eyebrow { margin-bottom: 0.5rem; font-size: 0.75rem; font-weight: 600; color: var(--color-indigo-600); }
.document-link { color: var(--color-indigo-600); font-size: 0.875rem; font-weight: 600; text-underline-offset: 4px; }
.document-link:hover { text-decoration: underline; }
th, td { padding: 1rem; vertical-align: top; }
</style>
