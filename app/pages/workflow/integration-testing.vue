<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      label="INTEGRATION TESTING"
      title="심사와 납품을 위한 통합테스트 결과 문서화"
    >
      GS인증 심사 및 공공기관 납품 준비를 위해 DeepInspector의 통합테스트
      시나리오와 결과를 엑셀 형태로 제작·정리했습니다. 업무 흐름별 검증 범위와
      예상 결과, 시험 결과를 연결해 검토자가 테스트 근거와 남은 보완 항목을
      확인할 수 있도록 구성했습니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="통합테스트 문서화 과정"
      @offset-change="sectionOffset = $event"
    />
    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
      />
    </div>

    <WorkflowAside title="검증 범위와 결과를 함께 전달하는 산출물">
      기능별 시험 내역과 전체 결과를 하나의 엑셀 문서로 구성해 심사·납품 준비
      과정에서 검토할 수 있도록 정리했습니다. 이 페이지는 통합테스트 문서의
      구성과 결과 기록 방식을 소개합니다. 문서에는 FAIL과 결과 미기입 항목도
      포함되어 있으며, 인증 취득이나 최종 납품 완료를 의미하지 않습니다.
    </WorkflowAside>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);
useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · Integration Testing`,
  description:
    "GS인증 심사 및 공공기관 납품 준비를 위한 AI 기반 시설물 결함검출 소프트웨어의 통합테스트 시나리오와 엑셀 결과서 제작 경험",
});

const steps = [
  {
    id: "document",
    label: "문서 구성",
    title: "심사·납품 검토를 위한 엑셀 결과서를 구성합니다",
    description:
      "표지, 사용권한, 개정이력, 테스트 결과, 시나리오 목록과 기능별 상세 시험 시트를 하나의 문서로 정리했습니다. 문서 버전과 검증 내역을 함께 확인할 수 있는 형태로 구성했습니다.",
    points: [
      "작성·검토·승인 정보를 기록할 수 있는 문서 관리 양식을 포함했습니다.",
      "통합테스트 시나리오 목록과 상세 시험 시트를 구분해 전체 범위와 개별 결과를 함께 살펴볼 수 있도록 했습니다.",
    ],
  },
  {
    id: "scenarios",
    label: "시나리오 설계",
    title: "실제 업무 흐름을 따라 검증 범위를 정리합니다",
    description:
      "로그인과 프로젝트 생성에서 전처리, 파노라마, AI 진단, 외관조사망도, 상태평가보고서까지 이어지는 실제 업무 흐름을 시나리오로 구성했습니다.",
    points: [
      "시나리오별 통합테스트 ID와 설명, 처리 흐름을 기록해 어떤 기능을 연결해서 검증하는지 명시했습니다.",
      "프로젝트 설정부터 결과 웹뷰어 조회와 다운로드까지 이어지는 과정을 검증 범위에 포함했습니다.",
    ],
    images: [
      {
        image: "integration-scenarios.png",
        width: 1504,
        height: 364,
        alt: "카메라 채널 2개와 4개 조건별 통합테스트 시나리오 명, ID, 설명 및 업무 흐름을 정리한 엑셀 목록",
        caption:
          "시나리오 목록 — 카메라 채널 조건별로 검증 범위와 업무 흐름을 정리한 예시",
      },
    ],
  },
  {
    id: "execution",
    label: "시험 결과 기록",
    title: "조건·입력·예상 결과와 실제 판정을 연결합니다",
    description:
      "각 시험 항목에 업무처리내용, 사전조건, 입력자료와 예상 결과를 작성하고 화면 ID, 시험 결과, 비고를 함께 기록했습니다. 동일한 조건으로 다시 확인할 수 있도록 구체적인 조작과 확인 기준을 남겼습니다.",
    points: [
      "페이지 이동, 필수 입력, 입력 길이 제한, 설정값 저장·조회 등 정상 동작과 예외 조건을 구분해 확인했습니다.",
      "시험 결과는 PASS·FAIL·N/A로 기록하고, 발견된 문제는 비고에 상세히 남겼습니다.",
      "예를 들어 상태평가보고서의 조사면적 반영 여부나 평가 등급 표시 차이를 기록해 보완할 동작을 확인할 수 있도록 했습니다.",
    ],
    images: [
      {
        image: "integration-details.png",
        width: 1549,
        height: 669,
        alt: "상태평가보고서의 설정·생성·웹뷰어 시험에 대한 사전조건, 입력자료, 예상 결과, 화면 ID와 PASS 판정 내역",
        caption:
          "상세 시험 기록 — 상태평가보고서의 정상·예외 조건과 항목별 시험 결과를 기록한 예시",
      },
    ],
  },
  {
    id: "summary",
    label: "현황 집계",
    title: "기능별 결과를 집계해 보완 범위를 확인합니다",
    description:
      "테스트 결과 시트에서 기능별 총 개수, PASS·FAIL·N/A, 결과 합계, 완료율과 성공률을 함께 정리했습니다. 상세 시험 내역을 요약해 수행 현황과 보완이 필요한 기능을 확인할 수 있도록 했습니다.",
    points: [
      "완료율과 성공률을 구분해 시험 수행 여부와 통과 여부를 각각 확인하도록 했습니다.",
      "FAIL의 비고와 결과 미기입 항목을 함께 살펴보며 수정 및 추가 검증 대상을 파악할 수 있도록 정리했습니다.",
    ],
    images: [
      {
        image: "integration-results.png",
        width: 764,
        height: 406,
        alt: "총 140개 항목 중 PASS 130개, FAIL 8개, N/A 1개, 결과 합계 139개와 완료율 99.3%, 성공률 92.4%를 표시한 통합테스트 결과표",
        caption:
          "결과 집계 — 첨부 예시의 기능별 판정, 완료율과 성공률을 한눈에 확인하는 요약표",
      },
    ],
  },
];

const fields = [
  {
    name: "No. · 업무처리내용",
    description: "시험 항목의 순서와 검증할 기능·동작",
  },
  {
    name: "사전조건",
    description:
      "서버 구동, 로그인, 프로젝트 생성, 이전 단계 완료 등 시험을 위한 조건",
  },
  {
    name: "입력자료",
    description: "입력값, 메뉴 선택, 버튼 클릭 등 시험 수행에 필요한 조작",
  },
  {
    name: "예상 결과",
    description:
      "화면 이동, 저장값 반영, 유효성 메시지 등 정상 동작의 판단 기준",
  },
  {
    name: "화면 ID",
    description: "시험 대상 화면과 항목을 연결하는 식별 정보",
  },
  {
    name: "시험 결과 · 비고",
    description: "PASS·FAIL·N/A 판정과 발견된 문제의 상세 내용",
  },
];
</script>
