<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      label="TEAM COLLABORATION"
      title="팀원 간 업무 협업과 소통"
    >
      화면에서 필요한 기능을 개발 가능한 작업으로 나누고, API 명세와 진행 상태를
      이슈에 연결합니다.<br>
      딥인스펙터 터널 프로젝트의 수평 파노라마 기능을 예시로 업무를 구체화하고
      공유하는 과정을 소개합니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="팀 협업 업무 과정"
      @offset-change="sectionOffset = $event"
    />

    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/workflow/jira"
      >
        <div
          v-if="step.id === 'presentation'"
          class="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
        >
          <div
            class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-3"
          >
            <p class="text-sm text-gray-600">
              jira-ppt.pdf
            </p>
            <a
              :href="presentationUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-semibold text-indigo-600 underline underline-offset-4"
            >PDF 새 탭에서 보기 ↗</a>
          </div>
          <iframe
            :src="`${presentationUrl}#view=FitH`"
            title="Jira 자료 PDF 미리보기"
            loading="lazy"
            class="h-[70vh] min-h-[420px] w-full border-0 sm:min-h-[600px]"
          />
          <p class="px-5 py-3 text-sm leading-6 text-gray-500">
            미리보기가 표시되지 않는 브라우저에서는 ‘PDF 새 탭에서 보기’를
            이용하세요.
          </p>
        </div>
      </WorkflowSection>
    </div>
    <WorkflowAside title="업무를 연결하는 기준">
      화면 요구사항, 개발 이슈, API 명세, 진행 현황이 같은 기능을 가리키도록
      정리합니다. 담당자는 구현 범위를 확인하고, 협업자는 연동에 필요한 정보를
      찾고, 팀은 남은 작업을 함께 파악할 수 있도록 하는 것이 업무 관리의
      핵심입니다.
    </WorkflowAside>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const presentationUrl = `${runtimeConfig.app.baseURL}images/workflow/jira/jira-ppt.pdf`;

const reportImages = [
  {
    label: "이슈 계층 목록",
    image: "jira-hierarchy.png",
    width: 925,
    height: 408,
    alt: "순서, 레벨, 이슈 유형, 이슈 키, 요약, 상태, 담당자를 상위 이슈와 Subtask 계층으로 정리한 엑셀 목록",
    caption:
      "계층 정렬 시트 — 상위 이슈와 하위 작업의 관계, 작업별 상태와 담당자를 확인합니다",
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
  title: `${siteMetaInfo.title} | Workflow · Team Collaboration`,
  description:
    "화면 요구사항을 Jira 이슈로 분해하고 API 명세, 작업 상태, 엑셀 요약으로 연결하는 개발 업무 방식",
});

const steps = [
  {
    id: "requirements",
    label: "요구사항 정리",
    title: "화면 설계서 기준으로 필요한 기능을 정리합니다",
    description:
      "수평 파노라마 화면에는 생성 목록, 이미지 확인, 수동 업로드, 검수 체크리스트 등 여러 기능이 함께 있습니다.\n화면의 동작과 데이터 흐름을 기준으로 개발 범위를 구체화합니다.",
    points: [
      "카메라·경간별 생성 상태와 완료 개수를 조회하는 기능을 구분합니다.",
      "파노라마 생성, 이미지 확인·업로드, 검수 항목 확인처럼 사용자의 동작을 작업 단위로 정리합니다.",
    ],
    imageHeight: "clamp(220px, 30vw, 360px)",
    images: [
      {
        image: "jira-figma.png",
        width: 1262,
        height: 854,
        alt: "수평 파노라마 생성 화면과 생성 범위·방법·방향 설정 및 동작 설명을 정리한 Figma 화면 설계서",
        caption:
          "수평 파노라마 화면 설계서 — 화면 구성과 동작 설명을 기준으로 필요한 기능을 정리합니다",
      },
      {
        image: "jira-screen.png",
        width: 1912,
        height: 909,
        alt: "카메라와 경간별 완료·검수 필요 상태, 이미지 확인, 체크리스트가 있는 수평 파노라마 생성 화면",
        caption:
          "수평 파노라마 화면 — 사용자 동작과 표시 데이터를 기준으로 기능 범위를 확인합니다",
      },
    ],
  },
  {
    id: "issues",
    label: "이슈 나누기",
    title: "기능 단위의 상위 이슈를 구현 작업으로 나눕니다",
    description:
      "‘전처리 - 수평 파노라마’ 상위 이슈 아래에 목록 조회, 이미지 확인, 생성, 수동 업로드, 확정, 체크리스트 조회 API를 하위 작업으로 연결합니다.\n하나의 기능을 구성하는 작업과 각각의 상태를 함께 살펴볼 수 있습니다.",
    points: [
      "상위 기능과 하위 API 작업의 관계를 유지해 구현 범위가 흩어지지 않도록 합니다.",
      "각 하위 작업의 상태를 개별적으로 관리하고, 스프린트 레이블로 작업 묶음을 식별합니다.",
    ],
    images: [
      {
        image: "jira-timeline.png",
        width: 1030,
        height: 803,
        alt: "Jira 타임라인에 수평 파노라마 상위 이슈와 여섯 개 하위 API 작업이 완료 상태로 표시된 화면",
        caption:
          "Jira 타임라인의 이슈 계층 — 기능별 하위 작업과 완료 상태를 확인합니다",
      },
    ],
  },
  {
    id: "specification",
    label: "API 설계",
    title: "이슈 안에 구현과 연동에 필요한 정보를 남깁니다",
    description:
      "수평 파노라마 수동 업로드 이슈에는 API URL과 HTTP 메서드, 화면설계서 ID, 동작 설명, 입력 필드, 성공 응답 예시가 함께 정리되어 있습니다.\n이슈 자체를 구현 범위와 연동 규격을 확인하는 기준으로 활용합니다.",
    points: [
      "프로젝트·카메라·경간 식별자와 업로드 이미지의 위치, 타입, 필수 여부를 명시합니다.",
      "담당자, 우선순위, BE·FE·SPRINT_1 레이블과 상위 항목을 함께 관리해 협업 맥락을 공유합니다.",
    ],
    images: [
      {
        image: "jira-task.png",
        width: 1290,
        height: 805,
        alt: "수평 파노라마 수동 업로드 API의 설명, 입력 명세, 담당자, 우선순위와 레이블이 작성된 Jira 하위 이슈",
        caption:
          "수동 업로드 API 이슈 — 화면과 API 규격, 담당 정보를 한곳에 정리합니다",
      },
    ],
  },
  {
    id: "report",
    label: "현황 공유",
    title: "이슈 현황을 집계해 남은 작업을 확인합니다",
    description:
      "보고용 자료로 자동 생성하는 엑셀은 ‘계층 정렬’과 ‘요약’ 시트로 구성합니다.\n계층 정렬 시트에서는 상위 이슈와 하위 작업을 연결해 이슈별 내용·상태·담당자를 확인하고, 요약 시트에서는 전체 이슈 수와 유형별·상태별 건수 및 비율을 집계합니다.\n상세 작업과 전체 진행 현황을 함께 공유해 남은 작업을 파악합니다.",
    points: [
      "레벨과 들여쓰기로 상위 이슈·Subtask 관계를 표현하고, 이슈 키·요약·상태·담당자를 함께 정리해 후속 작업을 확인합니다.",
      "요약 시트에서는 전체 219개 이슈를 Epic 직하위 Story/Task 85개와 Sub-task 134개로 구분합니다.",
      "버그·스토리·작업·Subtask의 구성과 완료·진행 중·검토 중·할 일·중단 상태를 집계합니다.",
    ],
    imageRatio: [1.95, 1],
    imageHeight: "clamp(220px, 30vw, 360px)",
    images: reportImages,
  },
  {
    id: "automation",
    label: "자동화 적용 및 확인",
    title: "Jira Automation으로 업무 현황을 Slack에 자동 공유합니다",
    description:
      "매일 오전 9시에 이번 스프린트의 할 일, 완료한 일, 남은 버그를 확인할 수 있도록 Jira 필터 링크를 Slack으로 전송합니다.\n자동화 흐름을 설정한 뒤 수동으로 실행하고, Slack에서 메시지 수신 결과를 확인합니다.",
    points: [
      "JQL로 프로젝트, 담당자, 스프린트 레이블과 상태 조건을 지정해 알림에 사용할 업무 필터를 준비합니다.",
      "Jira 관리자 설정의 시스템에서 전역 자동화 흐름을 구성합니다.",
      "예약 트리거와 Slack 웹후크 메시지 전송 작업을 연결하고, 업무별 필터 링크를 메시지에 포함합니다.",
      "흐름을 활성화한 뒤 ‘흐름 실행’으로 테스트하고, Slack 채널에서 알림과 필터 링크를 확인합니다.",
    ],
    images: [
      {
        image: "automation/jira_automation_1.png",
        width: 1911,
        height: 913,
        alt: "JQL로 관리할 프로젝트의 담당자와 레이블을 지정하고 완료·중단 상태를 제외한 Jira 필터",
        caption:
          "알림용 필터 준비 — JQL로 담당자의 스프린트 버그 중 완료·중단 상태를 제외해 조회하고, 해당 필터 링크를 Slack 알림에 활용합니다",
      },
      {
        image: "automation/jira_automation_2.png",
        width: 1915,
        height: 909,
        alt: "전역 자동화에서 매일 오전 9시 예약 트리거와 Slack 메시지 전송 작업을 연결한 내 할일 흐름",
        caption:
          "자동화 흐름 구성 — 매일 오전 9시 실행되도록 예약하고 업무별 Slack 알림을 연결합니다",
      },
      {
        image: "automation/jira_automation_3.png",
        width: 1914,
        height: 910,
        alt: "Slack 웹후크와 이번 스프린트의 남은 버그 필터 링크를 메시지에 설정한 Jira Automation 화면",
        caption:
          "알림 내용 설정 — Slack 웹후크와 업무별 Jira 필터 링크를 등록합니다",
      },
      {
        image: "automation/jira_automation_4.png",
        width: 1913,
        height: 908,
        alt: "활성화된 내 할일 자동화의 작업 메뉴에서 흐름 실행을 선택하는 화면",
        caption:
          "자동화 실행 확인 — 활성화한 흐름을 수동 실행해 메시지 전송을 테스트합니다",
      },
      {
        image: "automation/jira_automation_5.png",
        width: 985,
        height: 694,
        alt: "Slack saas 채널에 Automation for Jira가 보낸 스프린트 할 일, 완료한 일, 남은 버그 알림",
        caption:
          "Slack 수신 확인 — 업무별 알림과 Jira 필터 링크가 채널에 전달된 결과를 확인합니다",
      },
    ],
  },
  {
    id: "presentation",
    label: "사내 도입",
    title: "사내 업무 프로세스 수립을 위해 Jira 도입을 제안했습니다",
    description:
      "업무 관리 도구의 필요성과 간단한 용어정리, 시범도입할 프로젝트를 선정하여 도입을 제안했습니다",
  },
];
</script>
