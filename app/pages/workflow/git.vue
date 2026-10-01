<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader label="GIT" title="브랜치 운영과 PR 기반 개발">
      모든 소스코드 commit은 직접 push하지 않고, PR을 통해 코드 변경을 필요한
      branch에 통합합니다.<br />
      개인 작업과 제품·고객별 요구사항은 목적에 맞는 브랜치로 나누어 관리합니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="Git 브랜치 운영 방식"
      @offset-change="sectionOffset = $event"
    />

    <div class="space-y-14">
      <WorkflowSection :step="steps[0]" :number="1">
        <div class="overflow-x-auto rounded-2xl border border-gray-200">
          <table class="w-full min-w-[720px] text-left text-sm leading-6">
            <caption class="sr-only">
              브랜치 구분별 실제 이름과 역할
            </caption>
            <thead class="border-b border-gray-200 bg-gray-50 text-gray-900">
              <tr>
                <th scope="col" class="px-5 py-4 whitespace-nowrap">구분</th>
                <th scope="col" class="px-5 py-4">실제 브랜치 예시</th>
                <th scope="col" class="px-5 py-4">역할</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white text-gray-600">
              <tr v-for="branch in branches" :key="branch.role">
                <th
                  scope="row"
                  class="px-5 py-4 font-semibold whitespace-nowrap text-gray-900"
                >
                  {{ branch.role }}
                </th>
                <td class="px-5 py-4">
                  <div class="flex flex-wrap gap-2">
                    <code
                      v-for="name in branch.names"
                      :key="name"
                      class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >{{ name }}</code
                    >
                  </div>
                </td>
                <td class="px-5 py-4">{{ branch.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </WorkflowSection>

      <WorkflowSection :step="steps[1]" :number="2">
        <ol
          class="list-decimal space-y-10 pl-6 leading-7 text-gray-600 marker:font-semibold marker:text-indigo-600 sm:ml-14"
        >
          <li v-for="item in usageItems" :key="item.image">
            <p>{{ item.description }}</p>
            <p v-if="item.detailLink" class="mt-2">
              이슈 등록부터 수정 커밋 연결과 코드 변경까지의 자세한 과정은
              <NuxtLink
                :to="item.detailLink"
                class="font-semibold text-indigo-600 underline underline-offset-4"
                >Bug Fixing에서 확인할 수 있습니다 →</NuxtLink
              >
            </p>
            <HorizontalImageGallery
              v-if="item.extraImages?.length"
              :images="[item, ...item.extraImages]"
              image-directory="images/workflow"
              label="자동 빌드 및 결과 확인 이미지"
              class="mt-4"
            />
            <figure
              v-else
              class="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
            >
              <a
                :href="asset(item.image)"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`${item.caption} 이미지 원본 보기 (새 탭)`"
                class="block p-3 sm:p-5"
              >
                <img
                  :src="asset(item.image)"
                  :alt="item.alt"
                  :width="item.width"
                  :height="item.height"
                  loading="lazy"
                  class="h-auto w-full rounded-lg"
                />
              </a>
              <figcaption
                class="border-t border-gray-200 bg-white px-5 py-3 text-sm leading-6 text-gray-500"
              >
                {{ item.caption }} · 이미지를 누르면 원본을 새 탭에서 볼 수
                있습니다.
              </figcaption>
            </figure>
          </li>
        </ol>
      </WorkflowSection>
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const asset = (name) =>
  `${runtimeConfig.app.baseURL}images/workflow/${name}`;

const usageItems = [
  {
    description:
      "SI 혹은 정부과제 프로젝트, AI 기능, Frontend, Backend, Worker 등 기능별 repository를 따로 관리합니다.",
    image: "git/1.git_repository_list.png",
    width: 1914,
    height: 911,
    alt: "GitHub 저장소 전환 메뉴에 Backend, Frontend, Worker, 파노라마와 CI/CD 등 기능별 저장소가 표시된 화면",
    caption: "프로젝트·기능별 저장소 관리",
  },
  {
    description:
      "Jira 이슈와 코드 변경을 연결하고, PR과 Merge commit으로 개발·병합 이력을 남깁니다.",
    image: "git/2.git_mergecommit.png",
    width: 1913,
    height: 910,
    alt: "TDIS-282 버그 수정 브랜치의 PR 303을 main에 병합한 Merge commit과 코드 변경 내역",
    caption: "PR 병합과 Merge commit 이력",
  },
  {
    description:
      "develop, release/*, hotfix/* 브랜치와 prod_dtro, prod_gs_bridge, prod_smartfactory 등 프로젝트별 최종 납품 버전을 별도로 관리합니다. 모든 프로젝트의 최신 버전은 main 브랜치에 통합합니다.",
    image: "git/3.git_prod.png",
    width: 1916,
    height: 909,
    alt: "GitHub에서 프로젝트별 납품 브랜치인 prod_gs_bridge를 선택해 파일과 커밋 이력을 확인하는 화면",
    caption: "프로젝트별 납품 브랜치 관리",
  },
  {
    description:
      "각 개발 담당자는 할당받은 Jira 이슈 키(TDIS-* 등)를 커밋 메시지에 포함하고, 이슈 단위로 PR을 등록합니다.",
    image: "git/4.git_pr_list.png",
    detailLink: "/workflow/bug-fixing",
    width: 1916,
    height: 910,
    alt: "TDIS-282, TDIS-283 등 Jira 이슈 키와 작업 내용이 제목에 포함된 GitHub PR 목록",
    caption: "Jira 이슈 단위의 PR 관리",
  },
  {
    description:
      "각 개발 담당자가 커밋을 원격 브랜치에 push하면 웹후크로 변경을 감지하고, 테스트 서버에서 해당 프로젝트를 자동으로 빌드합니다. 빌드 결과는 브랜치, 커밋 해시, 작성자, 커밋 메시지와 함께 Slack으로 공유해 변경 사항에 빌드 오류가 없는지 확인합니다.",
    image: "cicd/cicd_slack3.png",
    width: 988,
    height: 733,
    alt: "Slack build_gs_be 채널에 개발자 작업 브랜치와 main의 빌드 성공 결과, 커밋 해시, 작성자와 커밋 메시지가 표시된 화면",
    caption: "원격 브랜치 push 감지 → 웹후크 실행 → 테스트 서버 빌드 → Slack 결과 확인",
    extraImages: [
      {
        image: "git/5.git_build_success.png",
        width: 1912,
        height: 907,
        alt: "ljh_feature_TDIS-249 브랜치에서 실행된 Jenkins 빌드 2601의 성공 상태와 Git 리비전 정보",
        caption: "빌드 성공 사례 — Jenkins에서 실행 브랜치와 빌드에 사용된 커밋을 확인합니다",
      },
      {
        image: "git/5.git_build_failed.png",
        width: 1915,
        height: 900,
        alt: "ljh_feature_TDIS-249 브랜치에서 실행된 Jenkins 빌드 2602의 실패 상태 화면",
        caption: "빌드 실패 사례 — 실패한 실행을 확인하고 Console Output에서 원인을 점검합니다",
      },
    ],
  },
];

useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · Git`,
  description:
    "main 중심의 PR 기반 개발, Jira 이슈별 커밋 연결과 개인 통합·제품·고객별 브랜치 운영 방식",
});

const steps = [
  {
    id: "branches",
    label: "브랜치별 역할",
    title: "브랜치별 역할",
    description:
      "공통 통합, 이슈 단위 개발, 개인 작업과 제품·고객별 분기에 따라 브랜치를 운영합니다.",
  },
  {
    id: "pull-requests",
    label: "개발·병합 방식",
    title: "활용 방식",
  },
];

const branches = [
  {
    role: "공통 통합",
    names: ["main"],
    description: "기능·버그 수정 PR이 최종적으로 모이는 중심 브랜치",
  },
  {
    role: "개발 통합",
    names: ["develop"],
    description: "개발 중인 기능과 수정 사항을 모아 배포 전 통합 검증을 진행하는 브랜치",
  },
  {
    role: "출시 준비",
    names: ["release/*"],
    description: "출시할 버전의 범위를 확정하고, 배포 전 테스트와 버그 수정으로 안정화하는 브랜치",
  },
  {
    role: "긴급 수정",
    names: ["hotfix/*"],
    description: "운영·납품 버전의 긴급 오류를 수정하는 브랜치로, 수정 사항은 해당 버전과 main 및 관련 개발 브랜치에 반영",
  },
  {
    role: "기능 개발",
    names: ["ljh_feature_TDIS-231"],
    description: "이슈 단위 개발 후 병합",
  },
  {
    role: "버그 수정",
    names: ["ljh_bugfix_TDIS-278"],
    description: "수정 작업 후 main에 PR 병합",
  },
  {
    role: "개인 통합",
    names: ["ljh_main", "nch"],
    description: "필요시 개발자별 여러 작업을 모아서 반영",
  },
  {
    role: "제품·고객별 분기",
    names: ["prod_dtro", "prod_gs_bridge", "prod_smartfactory"],
    description: "별도 개발 후 공통 코드와 통합한 이력",
  },
  {
    role: "기술 전환·통합",
    names: ["main_prisma", "TYPEORMMIGRATION", "main_merge_dtro"],
    description: "기술 전환 또는 큰 통합 작업의 이력 보존용",
  },
];
</script>
