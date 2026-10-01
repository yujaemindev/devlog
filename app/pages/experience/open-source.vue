<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      category="EXPERIENCE"
      label="Open Source"
      title="CVAT 기반 라벨링 도구의 업무 맞춤 확장"
    >
      오픈소스 라벨링 도구를 댐 안전진단의 데이터 검수와 AI 학습 흐름에
      연결했습니다. DeepLabel의 AI 데이터 Export 확장, 계정별 사용 제한, 운영
      배포 환경 정비를 중심으로 개선한 경험입니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="오픈소스 활용 목차"
      @offset-change="sectionOffset = $event"
    />
    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/experience/opensource-cvat"
      >
        <NuxtLink
          v-if="step.id === 'export'"
          to="/experience/si-project#learning-preprocessing"
          class="mt-5 inline-block text-sm font-semibold text-indigo-600 underline underline-offset-4"
          >SI project의 데이터 전처리 흐름 보기 →</NuxtLink
        >
        <div
          v-else-if="step.id === 'history'"
          class="overflow-x-auto rounded-2xl border border-gray-200"
        >
          <table class="w-full text-left text-sm leading-7">
            <caption class="bg-gray-50 px-5 py-3 text-left text-gray-600">
              2024년 11월~2026년 6월 변경 이력
            </caption>
            <thead class="border-y border-gray-200 bg-gray-50 text-gray-900">
              <tr>
                <th scope="col" class="whitespace-nowrap px-5 py-3">시기</th>
                <th scope="col" class="px-5 py-3">주요 수정사항</th>
                <th scope="col" class="px-5 py-3">대표 커밋</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-gray-600">
              <tr v-for="entry in history" :key="entry.period">
                <th
                  scope="row"
                  class="min-w-36 px-5 py-3 font-medium text-gray-900"
                >
                  {{ entry.period }}
                </th>
                <td class="min-w-72 px-5 py-3">{{ entry.description }}</td>
                <td class="min-w-40 px-5 py-3 font-mono text-xs leading-6">
                  {{ entry.commits }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </WorkflowSection>
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);

useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · Open Source`,
  description:
    "CVAT 기반 DeepLabel의 AI 학습 데이터 Export 확장, 계정별 메뉴 제한, Docker·NAS·Linux 운영 환경 개선 경험",
});

const screens = [
  { file: "1_register-labeling.png", alt: "라벨링 등록 화면" },
  { file: "2_deeplabel-login.png", alt: "DeepLabel 로그인 화면" },
  { file: "3_deeplabel-project-list.png", alt: "DeepLabel 프로젝트 목록" },
  { file: "4_deeplabel-project-details.png", alt: "DeepLabel 프로젝트 상세" },
  {
    file: "5_deeplabel-task-selection-member-capture-date.png",
    alt: "부재·촬영일자별 태스크 선택",
  },
  {
    file: "6_deeplabel-job-selection-member-capture-date-worker-id.png",
    alt: "부재·촬영일자·작업자별 잡 선택",
  },
  {
    file: "7_deeplabel-job-details-export-menu.png",
    alt: "잡 상세의 Export 메뉴",
  },
  {
    file: "8_deeplabel-job-details-export-dropdown.png",
    alt: "Export 메뉴 선택 목록",
    height: 1080,
  },
  {
    file: "9_deeplabel-job-details-ok-button.png",
    alt: "잡 상세의 Export 확인 버튼",
  },
];

const gallery = (start, end) =>
  screens.slice(start, end).map((screen) => ({
    image: screen.file,
    width: 1920,
    height: screen.height || 953,
    alt: screen.alt,
    caption: screen.alt,
  }));

const history = [
  {
    period: "2024.11~12",
    description:
      "관리자 생성 스크립트, 포트·환경변수 설정, Export 개발 및 복구, 결함 색상 반영",
    commits: "3582318, 773aef6, b6f4fc6",
  },
  {
    period: "2024.12",
    description: "Export 한글 지원, 한글 폰트 추가, 라벨·캡션 표시 개선",
    commits: "1a9e4ff, 27adc99",
  },
  {
    period: "2025.01~02",
    description:
      "AI Pipeline Export 추가, 중복 촬영일·스테이션 데이터 덮어쓰기 방지, 원본·GT·썸네일·어노테이션 확인 로직 보강",
    commits: "ce09b33, 8bfc08a, 27f1c86",
  },
  {
    period: "2025.02~04",
    description: "생성·삭제·관리자 관련 UI 제거 후 프로젝트 삭제 기능 복구",
    commits: "0ecf45a, 956f35c",
  },
  {
    period: "2025.03~05",
    description:
      "운영 배포 설정, 공유 폴더·마운트 변경, API 호출 수정, 누수 카테고리 참조 오류 수정 및 처리 지연 조정",
    commits: "cb212b7, 0a32688, 5149517, bd1fd41",
  },
  {
    period: "2025.05",
    description: "Docker 백업·빌드 및 변경 커밋 추출 스크립트 보강",
    commits: "dd79abd, f3ad60d, d5ea612",
  },
  {
    period: "2025.06~07",
    description:
      "AI 분석 이미지 Export 경로·메뉴명 변경, 아스팔트 댐마루 학습 데이터 Export 추가, 저장 폴더명 변경",
    commits: "16bac9a, f9d7292, b3f0ba3",
  },
  {
    period: "2025.11~2026.04",
    description:
      "NAS·로컬 포트 설정 수정, Linux 빌드 대응, Docker Compose 실행 방식 조정",
    commits: "014a0ab, 732e36f, 38ec497, 07d269d",
  },
  {
    period: "2026.06",
    description: "사용자별 AI학습 Export 메뉴 제한 및 디버깅 로그 추가",
    commits: "1d18a00 이후",
  },
];

const steps = [
  {
    id: "overview",
    label: "활용 개요",
    title: "라벨링 도구를 안전진단과 AI 학습 업무에 연결",
    description:
      "CVAT 기반 DeepLabel을 활용해 진단 이미지의 라벨을 확인·수정하고 AI 학습 데이터로 내보내는 흐름을 구성했습니다. 기존 Project·Task·Job 구조에 댐 진단 데이터의 구분을 연결하고, 현장 업무에 필요한 Export와 운영 설정을 확장했습니다.",
    points: [
      "AI 데이터 Export: 댐 속성에 맞는 학습 데이터 출력과 원본·GT·썸네일·어노테이션 확인을 보강했습니다.",
      "계정별 사용 제한: 업무에 맞게 생성·삭제·관리자 UI를 조정하고, 사용자별 AI학습 Export 메뉴 노출을 제한했습니다.",
      "운영 환경: 공유 폴더·NAS 마운트, 포트·환경변수와 Docker·Linux 빌드 구성을 정비했습니다.",
    ],
  },
  {
    id: "labeling",
    label: "라벨링 흐름",
    title: "진단 결과에서 Project·Task·Job으로 이어지는 검수",
    description:
      "결함 검출 결과 화면에서 ‘라벨링 등록’을 선택하고 DeepLabel에 로그인합니다. 생성된 프로젝트와 하위 Task·Job을 차례로 찾아 라벨링 이미지를 확인합니다.",
    points: [
      "프로젝트 목록·상세에서 등록된 진단 데이터를 확인합니다.",
      "Task는 부재·촬영일자, Job은 부재·촬영일자·작업자 정보를 기준으로 선택하는 화면 흐름입니다.",
      "결함 색상과 라벨·캡션 표시를 개선하고, 한글 Export와 폰트를 추가해 한글 데이터의 표시를 보완했습니다.",
    ],
    imageLayout: "gallery",
    images: gallery(0, 6),
  },
  {
    id: "export",
    label: "AI 데이터 Export",
    title: "검수 결과를 댐 속성별 AI 학습 데이터로 출력",
    description:
      "Job 상세의 메뉴에서 ‘Export job dataset’을 선택하고, Export format에서 댐 속성에 맞는 AI학습 기능을 고른 뒤 OK로 실행합니다. 이후 AI 모델 설정 화면에서 원본 데이터셋 수량을 확인하고 학습 전 전처리 데이터셋을 생성하는 흐름으로 연결합니다.",
    points: [
      "AI Pipeline Export를 추가하고 원본 이미지·GT·썸네일·어노테이션 확인 로직을 보강했습니다.",
      "촬영일·스테이션이 중복되는 데이터의 덮어쓰기를 방지하도록 처리했습니다.",
      "AI 분석 이미지의 Export 경로·메뉴명을 조정하고, 아스팔트 댐마루 학습 데이터 Export와 Asp_dmr 저장 폴더를 추가했습니다.",
      "누수 카테고리 참조 오류와 API 호출을 수정하고 처리 지연을 조정했습니다.",
    ],
    imageLayout: "gallery",
    images: gallery(6, 9),
  },
  {
    id: "account-controls",
    label: "사용 제한",
    title: "계정과 업무 범위에 맞춘 기능 노출 조정",
    description:
      "생성·삭제·관리자 관련 UI를 업무 범위에 맞춰 제거한 뒤 필요한 프로젝트 삭제 기능을 복구했습니다. 이후 사용자별 AI학습 Export 메뉴 제한과 디버깅 로그를 추가했습니다.",
    points: [
      "관리자 생성 스크립트를 마련하고 운영 계정 준비 과정을 정비했습니다.",
      "2025년의 UI 조정과 프로젝트 삭제 복구, 2026년 6월의 사용자별 Export 메뉴 제한을 단계적으로 반영했습니다.",
    ],
  },
  {
    id: "deployment",
    label: "운영 배포",
    title: "공유 스토리지와 Docker·Linux 실행 환경 정비",
    description:
      "Export 파일을 전달하는 공유 폴더와 NAS 경로를 운영 환경에 맞게 조정했습니다. 포트·환경변수·마운트 설정과 Docker Compose 실행 방식을 정리하고 Linux 빌드에 대응했습니다.",
    points: [
      "운영 배포 설정과 공유 폴더 마운트를 변경하고 NAS·로컬 포트 설정을 수정했습니다.",
      "Docker 백업·빌드 스크립트와 변경 커밋 추출 스크립트를 보강했습니다.",
      "Linux 빌드 대응 과정에서 setuptools 버전을 65.7.0으로 고정했습니다.",
    ],
  },
  {
    id: "history",
    label: "변경 이력",
    title: "Export 확장과 운영 개선의 주요 변경 이력",
    description:
      "CVAT 오픈소스를 활용하여 직접 추가한 기능 확장과 오류 수정, 사용 범위 조정, 배포 환경 개선을 시기별 대표 커밋으로 정리했습니다.",
  },
];
</script>
