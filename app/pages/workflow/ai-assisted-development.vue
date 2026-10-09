<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      label="WORKFLOW"
      title="AI-Assisted Development"
    >
      이 개발 블로그는 최초에는 직접 개발하였지만, 이후에는 MCP 서버 구축 및
      하네스 엔지니어링을 경험하기 위한 목적으로 AI 기술을 적극 활용하여
      제작했습니다. ChatGPT Work 및 Codex 사용을 하지 않아 토큰 소모가 크지
      않습니다. ChatGPT에 작업을 요청하는 데서 끝내지 않고, MCP 서버를 구축하여
      프로젝트와 Jira를 직접 다루는 흐름을 만들었습니다. 실제 대화에서 겪은 도구
      등록 문제, 이슈 계층 정리, 파일 이동, 테스트, 기능별 커밋과 Push까지의
      과정을 기록합니다.
    </WorkflowPageHeader>

    <div
      class="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-6 sm:px-7"
    >
      <p class="text-xs font-semibold tracking-widest text-indigo-700">
        한 번의 개발 요청이 남기는 기록
      </p>
      <ol class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(item, index) in flow"
          :key="item.title"
          class="rounded-xl border border-indigo-100 bg-white p-4"
        >
          <p class="text-xs font-semibold text-indigo-600">
            {{ String(index + 1).padStart(2, "0") }}
          </p>
          <h2 class="mt-2 font-bold text-gray-900">
            {{ item.title }}
          </h2>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            {{ item.detail }}
          </p>
        </li>
      </ol>
      <p class="mt-4 text-sm leading-6 text-gray-600">
        이 흐름은 ChatGPT와 로컬 MCP로 실행한 작업 사례입니다. GitHub for Jira
        공식 연동은 아직 설정하지 않았으며, 이 페이지에서 소개하는 Jira 작업과
        Git 커밋은 각각의 도구로 수행했습니다.
      </p>
    </div>

    <WorkflowStepNav
      :steps="steps"
      label="AI-Assisted Development 작업 사례 목차"
      @offset-change="sectionOffset = $event"
    />

    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
      >
        <div
          v-if="step.id === 'conversation'"
          class="mt-3 grid gap-3 md:grid-cols-2"
        >
          <div
            v-for="example in conversationExamples"
            :key="example.request"
            class="rounded-xl border border-gray-200 bg-gray-50 p-5"
          >
            <p class="text-xs font-semibold text-indigo-600">
              실제 대화에서 다룬 요청 · 요약
            </p>
            <p class="mt-2 font-semibold leading-7 text-gray-900">
              {{ example.request }}
            </p>
            <p class="mt-3 text-sm leading-6 text-gray-600">
              {{ example.outcome }}
            </p>
          </div>
          <figure
            class="overflow-hidden rounded-xl border border-gray-200 bg-white md:col-span-2"
          >
            <div
              class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3"
            >
              <p class="text-sm font-semibold text-gray-900">
                실제 ChatGPT 대화 화면 캡처
              </p>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  :disabled="activeCaptureIndex === 0"
                  aria-label="이전 대화 캡처"
                  class="rounded border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  @click="moveCapture(-1)"
                >
                  ←
                </button>
                <span
                  aria-live="polite"
                  class="text-sm text-gray-600"
                >
                  {{ activeCaptureIndex + 1 }} / {{ chatCaptureImages.length }}
                </span>
                <button
                  type="button"
                  :disabled="activeCaptureIndex === chatCaptureImages.length - 1"
                  aria-label="다음 대화 캡처"
                  class="rounded border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  @click="moveCapture(1)"
                >
                  →
                </button>
              </div>
            </div>
            <div
              ref="captureScrollContainer"
              class="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
              aria-label="실제 ChatGPT 대화 캡처 목록"
              @scroll.passive="syncCaptureIndex"
            >
              <div
                v-for="capture in chatCaptureImages"
                :key="capture.image"
                class="w-full shrink-0 snap-start"
              >
                <div
                  class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-3"
                >
                  <p class="text-sm font-medium text-gray-700">
                    {{ capture.title }}
                  </p>
                  <a
                    :href="capture.image"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-semibold text-indigo-600 underline underline-offset-4"
                  >
                    원본 전체 보기 ↗
                  </a>
                </div>
                <div class="max-h-[640px] overflow-y-auto bg-gray-50">
                  <img
                    :src="capture.image"
                    :alt="capture.alt"
                    loading="lazy"
                    class="block h-auto w-full"
                  >
                </div>
              </div>
            </div>
            <figcaption class="px-5 py-3 text-sm leading-6 text-gray-500">
              좌우로 스크롤하거나 화살표 버튼을 눌러 다른 대화 캡처를 확인할 수
              있습니다. 긴 이미지는 위아래로 스크롤하거나 원본 전체 보기로
              확인할 수 있습니다.
            </figcaption>
          </figure>
        </div>

        <div
          v-else-if="step.id === 'mcp'"
          class="overflow-hidden rounded-2xl border border-gray-200"
        >
          <div
            v-for="(group, groupIndex) in mcpTools"
            :key="group.title"
            class="px-5 py-4 sm:px-6"
            :class="{ 'border-t border-gray-200': groupIndex > 0 }"
          >
            <h3 class="font-semibold text-gray-900">
              {{ group.title }}
            </h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <code
                v-for="tool in group.tools"
                :key="tool"
                class="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >{{ tool }}</code>
            </div>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              {{ group.detail }}
            </p>
          </div>
        </div>

        <div
          v-else-if="step.id === 'jira'"
          class="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-7"
        >
          <p class="text-xs font-semibold tracking-widest text-indigo-600">
            DEVLOG 프로젝트의 이슈 계층
          </p>
          <div class="mt-4 rounded-xl border border-indigo-200 bg-white p-4">
            <span class="text-xs font-bold text-indigo-600">EPIC</span>
            <p class="mt-1 font-semibold text-gray-900">
              DEVLOG-23 · DEVLOG Site Structure
            </p>
          </div>
          <ul class="ml-5 mt-4 space-y-3 border-l-2 border-indigo-200 pl-5">
            <li
              v-for="item in jiraTasks"
              :key="item.key"
              class="relative rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <span
                aria-hidden="true"
                class="absolute -left-[23px] top-6 h-px w-5 bg-indigo-200"
              />
              <p class="text-xs font-semibold text-indigo-600">
                TASK · {{ item.key }}
              </p>
              <p class="mt-1 font-semibold text-gray-900">
                {{ item.name }}
              </p>
              <p class="mt-1 text-sm leading-6 text-gray-600">
                {{ item.detail }}
              </p>
            </li>
          </ul>
          <p class="mt-4 text-sm leading-6 text-gray-600">
            상세 화면은 각 Task의 Subtask로 나누고
            <code class="rounded bg-white px-1">area-*</code>,
            <code class="rounded bg-white px-1">page-*</code>
            라벨로 분류했습니다. 운영 규칙 문서는
            <code class="rounded bg-white px-1">DEVLOG-22</code>에 연결했습니다.
          </p>
        </div>

        <div
          v-else-if="step.id === 'git'"
          class="overflow-hidden rounded-2xl border border-gray-200"
        >
          <div class="border-b border-gray-200 bg-gray-50 px-5 py-4">
            <p class="text-sm font-semibold text-gray-900">
              2026.10.08 · 한 번의 대화에서 기능별로 나눈 3개 커밋
            </p>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              먼저 변경사항을 확인하고 작업 목적에 따라 나누어 커밋했습니다.
              Push는 별도 요청을 받은 뒤 실행했습니다.
            </p>
          </div>
          <ol class="divide-y divide-gray-200">
            <li
              v-for="commit in commits"
              :key="commit.hash"
              class="px-5 py-4 sm:flex sm:items-start sm:gap-5"
            >
              <a
                :href="`https://github.com/yujaemindev/devlog/commit/${commit.hash}`"
                class="shrink-0 font-mono text-sm font-semibold text-indigo-600 underline underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
              >{{ commit.hash }}</a>
              <div class="mt-2 sm:mt-0">
                <p class="font-semibold text-gray-900">
                  {{ commit.message }}
                </p>
                <p class="mt-1 text-sm leading-6 text-gray-600">
                  {{ commit.detail }}
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div
          v-else-if="step.id === 'verification'"
          class="grid gap-3 sm:grid-cols-3"
        >
          <div
            v-for="result in verification"
            :key="result.label"
            class="rounded-xl border border-gray-200 p-5"
          >
            <p class="text-sm text-gray-500">
              {{ result.label }}
            </p>
            <p class="mt-2 text-lg font-bold text-gray-900">
              {{ result.value }}
            </p>
            <p class="mt-1 text-xs leading-5 text-gray-500">
              {{ result.detail }}
            </p>
          </div>
        </div>

        <div
          v-else-if="step.id === 'lessons'"
          class="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
        >
          <p class="font-semibold text-gray-900">
            도구가 소스에 있다고 지금 대화에서 바로 보이는 것은 아닙니다.
          </p>
          <p class="mt-2 text-sm leading-7 text-gray-600">
            <code>create_directory</code>는 소스 구현과 단위 테스트를 마친
            뒤에도 실행 중인 MCP 도구 목록에는 아직 노출되지 않았습니다. 실제
            문서 폴더는 기존 <code>write_file</code>의 디렉터리 자동 생성
            기능으로 만든 후 <code>move_file</code>로 파일을 옮겼습니다. 신규
            도구는 설치 스크립트 재실행과 연결 갱신 이후 별도로 확인해야 합니다.
          </p>
        </div>
      </WorkflowSection>
    </div>

    <WorkflowAside
      title="대화는 요청의 시작이고, 결과는 코드와 기록으로 확인합니다"
    >
      <p>
        파일을 읽고 수정한 기록, Jira의 부모·자식 구조, 테스트 결과, 기능별 Git
        커밋을 각각 검증할 수 있도록 남겼습니다. 기존 페이지에서는
        <NuxtLink
          to="/experience/chatgpt-local-mcp"
          class="font-semibold text-indigo-600 underline underline-offset-4"
        >로컬 MCP 구축 과정</NuxtLink>,
        <NuxtLink
          to="/workflow/jira"
          class="font-semibold text-indigo-600 underline underline-offset-4"
        >팀 협업 방식</NuxtLink>,
        <NuxtLink
          to="/workflow/git"
          class="font-semibold text-indigo-600 underline underline-offset-4"
        >Git 운영 방식</NuxtLink>을 더 자세히 소개합니다.
      </p>
      <p class="mt-3 text-sm leading-6 text-gray-500">
        Jira와 GitHub의 공식 개발 정보 연동은 향후 작업으로 남겨두었습니다.
      </p>
    </WorkflowAside>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";
import { assetPath } from "@/utils/assetPath.js";

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const chatCaptureImages = [
  {
    image: assetPath(
      runtimeConfig.app.baseURL,
      "images/workflow/ai-assisted-development/final_chat_capture_stitched.png",
    ),
    title: "DEVLOG 메뉴 정리 대화",
    alt: "Jira DEVLOG 메뉴와 하위 작업 정리 요청에 대한 실제 ChatGPT 대화 전체 캡처",
  },
  {
    image: assetPath(
      runtimeConfig.app.baseURL,
      "images/workflow/ai-assisted-development/chat_body_stitched.png",
    ),
    title: "추가 대화 캡처",
    alt: "추가로 기록한 실제 ChatGPT 대화 화면 전체 캡처",
  },
];
const captureScrollContainer = ref(null);
const activeCaptureIndex = ref(0);

const syncCaptureIndex = () => {
  const container = captureScrollContainer.value;
  if (!container?.clientWidth) return;

  activeCaptureIndex.value = Math.min(
    chatCaptureImages.length - 1,
    Math.round(container.scrollLeft / container.clientWidth),
  );
};

const moveCapture = (direction) => {
  const container = captureScrollContainer.value;
  if (!container) return;

  const nextIndex = Math.max(
    0,
    Math.min(activeCaptureIndex.value + direction, chatCaptureImages.length - 1),
  );
  container.scrollTo({
    left: nextIndex * container.clientWidth,
    behavior: "smooth",
  });
};

useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · AI-Assisted Development`,
  description:
    "ChatGPT와 MCP로 로컬 프로젝트를 수정하고, DEVLOG Jira 이슈를 관리하고, 검증 후 Git 커밋과 Push까지 진행한 실제 AI-Assisted Development 사례",
});

const flow = [
  { title: "요청", detail: "ChatGPT에 자연어로 작업 범위와 조건 전달" },
  { title: "실행", detail: "MCP로 파일과 Jira 도구 호출" },
  { title: "검증", detail: "변경 내용·이슈 관계·테스트 결과 재확인" },
  { title: "기록", detail: "문서와 기능별 커밋으로 작업 이력 보존" },
];

const conversationExamples = [
  {
    request: "Jira의 DEVLOG 메뉴와 하위 작업을 정리해줘.",
    outcome:
      "DEVLOG-23 Epic 아래 메뉴 Task를 연결하고 Subtask와 라벨 규칙을 확인했습니다.",
  },
  {
    request: "현재 로컬 수정사항을 커밋할 수 있는 단위로 정리해줘.",
    outcome:
      "Jira 연동, 파일 관리, 운영 문서의 세 묶음으로 나누어 스테이징과 커밋을 진행했습니다.",
  },
];

const mcpTools = [
  {
    title: "파일과 프로젝트 탐색",
    tools: [
      "list_files",
      "read_file",
      "search_text",
      "replace_text",
      "move_file",
    ],
    detail:
      "관련 소스를 먼저 읽고 필요한 구간만 수정합니다. 파일 이동 뒤에는 import와 문서 링크도 확인합니다.",
  },
  {
    title: "Jira 작업 관리",
    tools: [
      "jira_search_issues",
      "jira_create_issue",
      "jira_update_issue",
      "jira_assign_issue",
      "jira_transition_issue",
    ],
    detail:
      "중복 이슈를 검색하고 Epic·Task·Subtask 관계를 설정한 뒤 담당자와 상태를 조회·변경합니다.",
  },
  {
    title: "검증과 Git",
    tools: [
      "run_dev_command",
      "git_status",
      "git_diff",
      "git_add",
      "git_commit",
      "git_push",
    ],
    detail:
      "허용된 검증 스크립트를 실행하고, 이번 작업 파일만 선택해 커밋합니다. Push는 별도 요청 시 실행합니다.",
  },
];

const jiraTasks = [
  { key: "DEVLOG-4", name: "Home", detail: "첫 화면과 관련한 작업" },
  {
    key: "DEVLOG-5",
    name: "Projects",
    detail: "프로젝트 목록 및 상세 화면 작업",
  },
  {
    key: "DEVLOG-6",
    name: "Workflow",
    detail: "개발 과정 소개와 하위 워크플로 페이지",
  },
  { key: "DEVLOG-7", name: "Experience", detail: "기술 경험과 사례 페이지" },
];

const commits = [
  {
    hash: "71ef95a",
    message: "feat(mcp): Jira Cloud 이슈 관리 도구 추가",
    detail:
      "Jira REST 클라이언트, API token 분리, 이슈 조작 도구와 관련 테스트",
  },
  {
    hash: "e3609fc",
    message: "feat(mcp): 파일 이동 및 디렉터리 생성 기능 추가",
    detail: "move_file·create_directory 구현, 경로 검증 및 동작 테스트",
  },
  {
    hash: "58efbb3",
    message: "docs(mcp): 운영 규칙 문서 분리 및 폴더 구조 정리",
    detail: "docs/jira·development·git·mcp 폴더로 규칙을 나누고 참조 경로 정리",
  },
];

const verification = [
  {
    label: "단위 테스트",
    value: "28개 통과",
    detail: "2026.10.08 기준, 2개 건너뜀",
  },
  { label: "ESLint", value: "통과", detail: "npm run lint" },
  { label: "타입 검사", value: "통과", detail: "npm run typecheck" },
];

const steps = [
  {
    id: "conversation",
    label: "실제 대화",
    title: "기능 요청을 실행 가능한 개발 작업으로 바꿉니다",
    description:
      "대화에서 작업 조건을 정하고 MCP가 실제 파일이나 이슈를 수정하도록 요청했습니다. 결과를 다시 조회하고, 완료하지 않은 작업과 완료한 작업을 구분하는 과정을 반복했습니다.",
    points: [
      "Codex와 ChatGPT Work로 전환하지 않고 로컬 MCP만 사용하도록 프로젝트 규칙을 정했습니다.",
      "기존 수정사항은 보존하고 Git Push는 명시적으로 요청한 경우에만 수행합니다.",
    ],
  },
  {
    id: "mcp",
    label: "로컬 MCP",
    title: "대화와 개발 환경 사이에 제한된 실행 도구를 연결합니다",
    description:
      "Windows·Git Bash·Node.js 환경에서 MCP 서버를 구성하고 OpenAI Tunnel로 ChatGPT와 연결했습니다. 파일, 명령, Git, Jira의 기능을 개별 도구로 등록해 허용된 작업만 실행합니다.",
    points: [
      "mcp-create.sh로 서버 빌드, 도구 등록 확인, 터널 재시작 및 /readyz 응답 확인 절차를 구성했습니다.",
      "인증값은 .jira-api-token과 .tunnel-client-api-key 같은 로컬 파일에서 읽고 Git에 포함하지 않습니다.",
      "MCP 서버의 작업 규칙은 docs/LOCAL_MCP_INSTRUCTIONS.md를 진입점으로 관리합니다.",
    ],
  },
  {
    id: "jira",
    label: "Jira 구조화",
    title: "DEVLOG 메뉴 구조를 Epic·Task·Subtask로 정리합니다",
    description:
      "웹사이트의 메뉴와 Jira 업무를 대응시켰습니다. 여러 Epic 대신 DEVLOG-23 하나 아래 상위 메뉴 Task 네 개를 연결하고, 각 상세 페이지를 Subtask로 관리하는 방식을 선택했습니다.",
    points: [
      "DEVLOG-22에 이슈 유형, 부모 관계, area-*·page-* 라벨, 변경·삭제 절차를 문서화했습니다.",
      "jira_update_issue의 parent 변경을 구현하고, 미사용 Epic 삭제 기능은 제한된 대상과 하위 이슈 검사를 조건으로 추가했습니다.",
      "도구 추가 후에는 실제 이슈의 부모 관계와 라벨이 의도대로 반영됐는지 다시 조회합니다.",
    ],
  },
  {
    id: "git",
    label: "Git 커밋",
    title: "한 번에 수정한 파일도 목적별로 나누어 커밋합니다",
    description:
      "MCP·Jira·운영 문서 작업이 섞여 있던 로컬 변경을 기능별로 분류했습니다. 공통 파일은 필요한 구간만 나누어 스테이징하고, 커밋 3개를 만든 뒤 별도 요청에 따라 Push했습니다.",
    points: [
      "git_status와 git_diff로 미커밋 변경과 이미 반영된 코드를 구분했습니다.",
      "Jira 연동 → 파일 관리 기능 → 운영 규칙 문서의 순서로 커밋하고 원격 main과 동기화했습니다.",
      "이 커밋들에 DEVLOG 이슈 키는 없으며, GitHub와 Jira의 공식 자동 연동이 완료된 상태는 아닙니다.",
    ],
  },
  {
    id: "verification",
    label: "수정 검증",
    title: "완료 판정은 실행한 검사 결과를 기준으로 합니다",
    description:
      "도구 등록 테스트와 파일 이동·디렉터리 생성·Jira API 테스트를 실행하고, Nuxt 프로젝트의 린트와 타입 검사도 수행했습니다. 실제 검사 결과를 보고하고 건너뛴 항목도 구분했습니다.",
    points: [
      "파일 수정 뒤 git_status로 남은 미커밋 변경사항이 없는지 확인했습니다.",
      "권한·환경 때문에 실행할 수 없는 과정은 성공했다고 기록하지 않습니다.",
    ],
  },
  {
    id: "lessons",
    label: "문제 해결",
    title: "서버 구현과 ChatGPT에 노출된 도구 상태를 따로 검증합니다",
    description:
      "새 도구를 구현해도 기존 대화에서 목록이 갱신되지 않는 문제를 겪었습니다. 소스 등록, 빌드 결과, 터널 연결, 현재 대화의 도구 목록을 각각 확인하는 절차를 만들었습니다.",
    points: [
      "tools/list에는 새 도구가 존재하지만 기존 세션에 표시되지 않으면 연결 또는 스키마 캐시 상태를 점검합니다.",
      "새 세션으로 작업을 넘길 수 있도록 Git·Jira·보안·테스트 규칙을 docs 아래 계층형 문서로 분리했습니다.",
      "확인된 기능과 설치·재연결이 필요한 기능을 구분해 설명합니다.",
    ],
  },
];
</script>
