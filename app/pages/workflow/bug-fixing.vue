<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader label="BUG FIXING" title="버그 기록부터 코드 수정까지">
        발견된 문제를 Jira 이슈로 정리하고, 수정 커밋을 연결해 변경 내용을
        추적합니다. 딥인스펙터 터널 프로젝트의 LCR(Lean/Cut/Resize) 편집
        도구에서 설정한 CUT 위치와 결과물의 위치가 달랐던 TDIS-255 사례로 버그
        대응 과정을 소개합니다.
    </WorkflowPageHeader>
    <WorkflowStepNav :steps="steps" label="버그 수정 과정" @offset-change="sectionOffset = $event" />

    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/workflow/bug-fixing"
      />
    </div>

    <WorkflowAside title="수정 이력과 검증 결과를 구분해 관리합니다">
        이슈와 커밋을 연결하면 어떤 문제를 위해 코드를 변경했는지 확인할 수
        있습니다. 수정 후에는 이슈에 기록한 환경과 조건으로 다시 확인하고,
        기대한 결과와 실제 결과가 일치하는지 검증한 뒤 완료 상태로 관리합니다.
        첨부 사례는 이슈 등록과 수정 커밋 연결까지의 기록이며, 재검증 결과나
        최종 완료 상태는 포함하지 않습니다.
    </WorkflowAside>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);

useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · Bug Fixing`,
  description:
    "Jira 버그 목록, 재현 정보, GitHub 커밋 연동과 코드 변경 이력을 연결하는 버그 수정 업무 방식",
});

const steps = [
  {
    id: "triage",
    label: "버그 확인",
    title: "미완료 버그를 모아 담당 작업을 확인합니다",
    description:
      "Jira의 버그 확인 목록에서 상위 항목에 속한 버그 중 완료되지 않은 이슈를 최신 등록순으로 조회합니다. 문제 요약과 담당자, 보고자를 함께 확인해 대응할 작업을 파악합니다.",
    points: [
      "상위 항목, 이슈 유형, 완료 여부를 필터 조건으로 사용해 확인할 버그의 범위를 좁힙니다.",
      "이슈 제목의 FE·BE와 기능명을 통해 발생 영역을 구분하고, 담당자와 보고자를 확인합니다.",
    ],
    images: [{
      image: "bug-list.png",
      width: 1084,
      height: 774,
      alt: "TDIS-1의 미완료 버그를 최신순으로 조회하며 문제 요약, 담당자와 보고자를 표시한 Jira 목록",
      caption: "버그 확인 목록 — 미완료 이슈와 담당 정보를 함께 확인합니다",
    }],
  },
  {
    id: "reproduction",
    label: "상세 기록",
    title: "발생 환경과 기대 결과의 차이를 기록합니다",
    description:
      "TDIS-255에는 테스트 서버, 프로젝트 ID 12, 편집 도구에서 설정한 1번 CUT 위치와 처리 결과의 CUT 위치가 다르다는 현상을 기록했습니다. 편집 화면과 결과 이미지를 함께 남겨 문제를 비교할 수 있도록 합니다.",
    points: [
      "발생 환경과 대상 프로젝트를 명시해 같은 조건에서 문제를 확인할 수 있도록 합니다.",
      "설정 화면과 결과물을 비교하고, BUG·FE·SPRINT_1 레이블 및 담당자를 연결해 작업 맥락을 공유합니다.",
    ],
    images: [{
      image: "bug-detail.png",
      width: 1284,
      height: 792,
      alt: "TDIS-255의 테스트 환경, CUT 위치 불일치 설명, 편집 화면과 결과 이미지 및 담당 정보",
      caption:
        "버그 상세 이슈 — 설정한 CUT 위치와 결과물의 차이를 화면으로 기록합니다",
    }],
  },
  {
    id: "commit",
    label: "커밋 연결",
    title: "이슈 키로 수정 커밋을 연결합니다",
    description:
      "커밋 메시지에 [TDIS-255]를 포함해 버그 이슈와 코드 변경을 연결합니다. Jira 개발 패널에서 GitHub 저장소의 수정 커밋 ff20fa4와 변경 파일을 확인할 수 있습니다.",
    points: [
      "커밋 메시지에 이슈 키와 수정 내용을 남겨 변경 목적을 추적할 수 있도록 합니다.",
      "이슈의 개발 패널에서 커밋과 LeanCutEditor.tsx 파일을 찾아 실제 수정 내용으로 이동합니다.",
    ],
    images: [{
      image: "bug-commit.png",
      width: 1019,
      height: 809,
      alt: "Jira TDIS-255 개발 패널에 연결된 GitHub 커밋 ff20fa4와 LeanCutEditor.tsx 변경 파일",
      caption: "Jira와 GitHub 커밋 연동 — 버그 이슈에서 수정 이력으로 이어집니다",
    }],
  },
  {
    id: "changes",
    label: "코드 수정",
    title: "변경 전후의 코드를 비교해 수정 범위를 확인합니다",
    description:
      "GitHub 커밋 화면에서 LeanCutEditor.tsx의 변경 내용을 비교합니다.",
    points: [
      "한 파일의 45줄 추가·5줄 삭제 내역을 통해 변경 범위를 확인합니다.",
      "이슈에 기록된 CUT 위치 불일치와 관련된 코드 변경을 함께 살펴보고, 수정 후 재확인할 동작의 기준으로 삼습니다.",
    ],
    images: [{
      image: "bug-code.png",
      width: 1913,
      height: 808,
      alt: "GitHub 커밋 ff20fa4에서 LeanCutEditor.tsx의 이미지 위치·크기 관련 코드를 비교한 변경 화면",
      caption: "코드 변경 내역 — 이슈와 연결된 커밋의 수정 전후를 비교합니다",
    }],
  },
];
</script>
