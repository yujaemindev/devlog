<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      category="EXPERIENCE"
      label="API GATEWAY"
      title="Nginx로 웹·API의 공통 진입점 구성"
    >
      DeepInspector의 프론트엔드와 백엔드를 하나의 도메인으로 연결하고, HTTPS,
      요청 경로 변환, 파일 경로와 정적 리소스 캐시를 Nginx에서 관리했습니다.
      Windows 서버에 적용한 설정을 바탕으로 게이트웨이 구성 경험을 정리했습니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="API Gateway 구성"
      @offset-change="sectionOffset = $event"
    />
    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
      >
        <template #point-extra="{ point }">
          <ol
            v-if="step.id === 'gateway-tls' && point.includes('HSTS')"
            class="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7"
          >
            <li>
              <strong>max-age=31536000</strong>: 브라우저가 HTTPS 응답으로 이
              헤더를 받으면, 이후 1년 동안 HTTP 주소도 HTTPS로 바꿔 접속합니다.
            </li>
            <li>
              <strong>includeSubDomains</strong>: deepinspector.ai뿐 아니라
              api.deepinspector.ai 같은 하위 도메인에도 적용합니다. 실제로 하위
              도메인을 운영하지 않았지만, 향후 하위 도메인을 만들 경우를 대비해
              보안 정책을 미리 적용했습니다.
            </li>
            <li>
              <strong>proxy_hide_header</strong>: 내부 백엔드가 보내는 HSTS
              헤더는 전달하지 않고, Nginx에서 정한 값으로 관리합니다.
            </li>
          </ol>
          <div
            v-if="
              step.id === 'gateway-routing' &&
              point.includes('X-Forwarded-Host')
            "
            class="mt-3 text-sm leading-7"
          >
            <p>
              사용자가 https://deepinspector.ai로 접속한 경우, 다음 정보가
              백엔드에 전달됩니다.
            </p>
            <ul class="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Host $host</strong>: 백엔드 요청의 호스트를 원래
                도메인인 deepinspector.ai로 지정합니다.
              </li>
              <li>
                <strong>X-Forwarded-Host $host</strong>: 프록시를 거치기 전의
                도메인인 deepinspector.ai를 별도 헤더로 전달합니다.
              </li>
              <li>
                <strong>X-Forwarded-Proto $scheme</strong>: 사용자가 Nginx에
                접속한 프로토콜인 https를 전달합니다.
              </li>
            </ul>
            <p class="mt-3">
              내부 연결이 HTTP여도 백엔드는 이 정보를 활용해 외부 HTTPS 주소를
              기준으로 리다이렉트 주소나 링크를 생성할 수 있습니다. Host와
              X-Forwarded-Host는 같은 값을 전달하지만, 백엔드나 프레임워크가
              참고하는 헤더가 달라 함께 설정했습니다.
            </p>
          </div>
        </template>
        <NuxtLink
          v-if="step.id === 'gateway-tls'"
          to="/experience/https"
          class="inline-flex text-sm font-semibold text-indigo-600 underline underline-offset-4 hover:text-indigo-800 sm:ml-14"
        >
          HTTPS 인증서 발급·갱신과 Nginx 적용 과정 보기 →
        </NuxtLink>
        <div
          v-if="step.id === 'gateway-entry'"
          class="overflow-x-auto rounded-xl border border-gray-200"
          role="region"
          aria-label="외부 경로와 내부 서비스 연결 표"
          tabindex="0"
        >
          <table class="w-full min-w-[720px] text-left text-sm leading-6">
            <caption class="sr-only">
              DeepInspector 요청 경로별 프록시 대상과 역할
            </caption>
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th scope="col">외부 요청 경로</th>
                <th scope="col">내부 전달 경로</th>
                <th scope="col">역할</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="route in routes" :key="route.path">
                <th scope="row" class="font-medium text-gray-900">
                  {{ route.path }}
                </th>
                <td class="font-mono text-xs">{{ route.target }}</td>
                <td>{{ route.purpose }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <figure
          v-if="step.code"
          class="mt-6 min-w-0 overflow-hidden rounded-xl border border-gray-200 sm:ml-14"
        >
          <figcaption
            class="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
          >
            {{ step.codeTitle || `${step.label} 설정` }}
          </figcaption>
          <pre
            class="overflow-x-auto bg-gray-900 p-4 text-sm leading-7 text-gray-100"
          ><code>{{ step.code }}</code></pre>
        </figure>
        <dl
          v-if="step.codeDetails?.length"
          class="mt-4 space-y-4 rounded-xl bg-gray-50 p-4 text-sm leading-7 sm:ml-14"
        >
          <div v-for="detail in step.codeDetails" :key="detail.term">
            <dt class="font-semibold text-gray-900">{{ detail.term }}</dt>
            <dd class="mt-1 text-gray-600">{{ detail.description }}</dd>
          </div>
        </dl>
        <p
          v-if="step.note"
          class="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-600 sm:ml-14"
        >
          {{ step.note }}
        </p>
      </WorkflowSection>
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";
import { routes, steps } from "@/data/api-gateway.js";

const sectionOffset = ref(171);
useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · API Gateway`,
  description:
    "DeepInspector의 API Gateway 구성 경험: HTTPS, 경로 라우팅, Rate limit·Timeout 정책 구분과 Redis·MySQL 기반 워커의 Circuit breaker·Retry 처리",
});
</script>

<style scoped>
th,
td {
  padding: 1rem;
  vertical-align: top;
}
</style>
