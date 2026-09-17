<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${headerHeight + stepNavHeight + 16}px` }"
  >
    <header class="pt-8 pb-4 md:pt-12">
      <p class="mb-3 text-sm font-semibold tracking-widest text-indigo-600">
        WORKFLOW / JIRA
      </p>
      <h1
        class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl"
      >
        Jira로 정리하는 개발 업무
      </h1>
      <p class="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
        화면에서 필요한 기능을 개발 가능한 작업으로 나누고, API 명세와 진행
        상태를 이슈에 연결합니다. 딥인스펙터 터널 프로젝트의 수평 파노라마
        기능을 예시로 업무를 구체화하고 공유하는 과정을 소개합니다.
      </p>
    </header>
      <nav
        ref="stepNav"
        aria-label="Jira 업무 과정"
        class="sticky z-40 mb-8 flex flex-wrap gap-2 border-b border-gray-100 bg-white py-3"
        :style="{ top: `${headerHeight}px` }"
      >
        <a
          v-for="(step, index) in steps"
          :key="step.id"
          :href="`#${step.id}`"
          class="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
        >
          {{ String(index + 1).padStart(2, "0") }} · {{ step.label }}
        </a>
      </nav>

    <div class="space-y-14">
      <section
        v-for="(step, index) in steps"
        :id="step.id"
        :key="step.id"
        class="scroll-mt-[var(--section-offset)]"
      >
        <div class="mb-5 flex items-start gap-4">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600"
            >{{ String(index + 1).padStart(2, "0") }}</span
          >
          <div>
            <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">
              {{ step.title }}
            </h2>
            <p class="mt-3 leading-7 text-gray-600">{{ step.description }}</p>
          </div>
        </div>
        <ul class="mb-6 space-y-2 pl-5 text-gray-600 sm:ml-14">
          <li
            v-for="point in step.points"
            :key="point"
            class="list-disc leading-7 marker:text-indigo-400"
          >
            {{ point }}
          </li>
        </ul>
        <div v-if="step.id === 'report'" class="grid items-start gap-4 md:grid-cols-[2fr_1fr]">
          <figure
            v-for="report in reportImages"
            :key="report.image"
            class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
          >
            <a
              :href="asset(report.image)"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${report.label} 이미지 원본 보기 (새 탭)`"
              class="block p-3"
            >
              <img
                :src="asset(report.image)"
                :alt="report.alt"
                :width="report.width"
                :height="report.height"
                loading="lazy"
                class="h-auto w-full rounded-lg"
              />
            </a>
            <figcaption class="border-t border-gray-200 bg-white px-5 py-3 text-sm leading-6 text-gray-500">
              {{ report.caption }} · 이미지를 누르면 원본을 새 탭에서 볼 수 있습니다.
            </figcaption>
          </figure>
        </div>
        <figure
          v-else
          class="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
        >
          <a
            :href="asset(step.image)"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${step.label} 이미지 원본 보기 (새 탭)`"
            class="block p-3 sm:p-5"
          >
            <img
              :src="asset(step.image)"
              :alt="step.alt"
              :width="step.width"
              :height="step.height"
              loading="lazy"
              class="mx-auto h-auto w-full max-w-full rounded-lg"
            />
          </a>
          <figcaption
            class="border-t border-gray-200 bg-white px-5 py-3 text-sm leading-6 text-gray-500"
          >
            {{ step.caption }} · 이미지를 누르면 원본을 새 탭에서 볼 수
            있습니다.
          </figcaption>
        </figure>
      </section>
    </div>
    <aside class="mt-14 border-t border-gray-200 pt-8">
      <h2 class="text-xl font-bold text-gray-900">업무를 연결하는 기준</h2>
      <p class="mt-3 leading-8 text-gray-600">
        화면 요구사항, 개발 이슈, API 명세, 진행 현황이 같은 기능을 가리키도록
        정리합니다. 담당자는 구현 범위를 확인하고, 협업자는 연동에 필요한 정보를
        찾고, 팀은 남은 작업을 함께 파악할 수 있도록 하는 것이 업무 관리의
        핵심입니다.
      </p>
    </aside>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const runtimeConfig = useRuntimeConfig();
const asset = (name) => `${runtimeConfig.app.baseURL}images/workflow/${name}`;
const headerHeight = useState('site-header-height', () => 89);
const stepNav = ref(null);
const stepNavHeight = ref(66);
let stepNavObserver;

onMounted(() => {
  const updateHeight = () => {
    stepNavHeight.value = stepNav.value.getBoundingClientRect().height;
  };
  updateHeight();
  stepNavObserver = new ResizeObserver(updateHeight);
  stepNavObserver.observe(stepNav.value);
});
onBeforeUnmount(() => stepNavObserver?.disconnect());

const reportImages = [
  {
    label: "이슈 계층 목록",
    image: "jira-hierarchy.png",
    width: 925,
    height: 407,
    alt: "순서, 레벨, 이슈 유형, 이슈 키, 요약, 상태, 담당자를 상위 이슈와 Subtask 계층으로 정리한 엑셀 목록",
    caption: "계층 정렬 시트 — 상위 이슈와 하위 작업의 관계, 작업별 상태와 담당자를 확인합니다",
  },
  {
    label: "이슈 현황 요약",
    image: "jira-summary.png",
    width: 454,
    height: 408,
    alt: "전체 이슈 219개와 이슈 유형별·상태별 건수 및 비율을 정리한 엑셀 요약",
    caption: "요약 시트 — 첨부 시점의 전체 이슈 구성과 진행 상태를 집계합니다",
  },
];

useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · Jira`,
  description:
    "화면 요구사항을 Jira 이슈로 분해하고 API 명세, 작업 상태, 엑셀 요약으로 연결하는 개발 업무 방식",
});

const steps = [
  {
    id: "requirements",
    label: "화면과 요구사항",
    title: "화면을 기준으로 필요한 기능을 정리합니다",
    description:
      "수평 파노라마 화면에는 생성 목록, 이미지 확인, 수동 업로드, 검수 체크리스트 등 여러 기능이 함께 있습니다. 화면의 동작과 데이터 흐름을 기준으로 개발 범위를 구체화합니다.",
    points: [
      "카메라·경간별 생성 상태와 완료 개수를 조회하는 기능을 구분합니다.",
      "파노라마 생성, 이미지 확인·업로드, 검수 항목 확인처럼 사용자의 동작을 작업 단위로 정리합니다.",
    ],
    image: "jira-screen.png",
    width: 1912,
    height: 909,
    alt: "카메라와 경간별 완료·검수 필요 상태, 이미지 확인, 체크리스트가 있는 수평 파노라마 생성 화면",
    caption:
      "수평 파노라마 화면 — 사용자 동작과 표시 데이터를 기준으로 기능 범위를 확인합니다",
  },
  {
    id: "issues",
    label: "이슈 분해",
    title: "기능 단위의 상위 이슈를 구현 작업으로 나눕니다",
    description:
      "‘전처리 - 수평 파노라마’ 상위 이슈 아래에 목록 조회, 이미지 확인, 생성, 수동 업로드, 확정, 체크리스트 조회 API를 하위 작업으로 연결합니다. 하나의 기능을 구성하는 작업과 각각의 상태를 함께 살펴볼 수 있습니다.",
    points: [
      "상위 기능과 하위 API 작업의 관계를 유지해 구현 범위가 흩어지지 않도록 합니다.",
      "각 하위 작업의 상태를 개별적으로 관리하고, 스프린트 레이블로 작업 묶음을 식별합니다.",
    ],
    image: "jira-timeline.png",
    width: 1030,
    height: 803,
    alt: "Jira 타임라인에 수평 파노라마 상위 이슈와 여섯 개 하위 API 작업이 완료 상태로 표시된 화면",
    caption:
      "Jira 타임라인의 이슈 계층 — 기능별 하위 작업과 완료 상태를 확인합니다",
  },
  {
    id: "specification",
    label: "API 명세",
    title: "이슈 안에 구현과 연동에 필요한 정보를 남깁니다",
    description:
      "수평 파노라마 수동 업로드 이슈에는 API URL과 HTTP 메서드, 화면설계서 ID, 동작 설명, 입력 필드, 성공 응답 예시가 함께 정리되어 있습니다. 이슈 자체를 구현 범위와 연동 규격을 확인하는 기준으로 활용합니다.",
    points: [
      "프로젝트·카메라·경간 식별자와 업로드 이미지의 위치, 타입, 필수 여부를 명시합니다.",
      "담당자, 우선순위, BE·FE·SPRINT_1 레이블과 상위 항목을 함께 관리해 협업 맥락을 공유합니다.",
    ],
    image: "jira-task.png",
    width: 1290,
    height: 805,
    alt: "수평 파노라마 수동 업로드 API의 설명, 입력 명세, 담당자, 우선순위와 레이블이 작성된 Jira 하위 이슈",
    caption:
      "수동 업로드 API 이슈 — 화면과 API 규격, 담당 정보를 한곳에 정리합니다",
  },
  {
    id: "report",
    label: "현황 공유",
    title: "이슈 현황을 집계해 남은 작업을 확인합니다",
    description:
      "보고용 자료로 자동 생성하는 엑셀은 ‘계층 정렬’과 ‘요약’ 시트로 구성합니다. 계층 정렬 시트에서는 상위 이슈와 하위 작업을 연결해 이슈별 내용·상태·담당자를 확인하고, 요약 시트에서는 전체 이슈 수와 유형별·상태별 건수 및 비율을 집계합니다. 상세 작업과 전체 진행 현황을 함께 공유해 남은 작업을 파악합니다.",
    points: [
      "레벨과 들여쓰기로 상위 이슈·Subtask 관계를 표현하고, 이슈 키·요약·상태·담당자를 함께 정리해 후속 작업을 확인합니다.",
      "요약 시트에서는 전체 219개 이슈를 Epic 직하위 Story/Task 85개와 Sub-task 134개로 구분합니다.",
      "버그·스토리·작업·Subtask의 구성과 완료·진행 중·검토 중·할 일·중단 상태를 집계합니다.",
    ],
    image: "jira-summary.png",
    width: 454,
    height: 408,
    alt: "전체 이슈 219개, 하위 작업 134개, 완료 145개 및 상태별 비율을 정리한 엑셀 요약",
    caption: "엑셀 현황 요약 — 첨부 시점의 이슈 유형과 상태 분포입니다",
  },
];
</script>
