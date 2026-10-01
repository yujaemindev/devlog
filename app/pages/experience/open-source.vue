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
  {
    file: "1.딥라벨등록_watermarked.png",
    width: 1251,
    height: 744,
    alt: "댐 결함 검출 결과에서 이미지를 선택하고 라벨링 등록 버튼을 누르는 화면",
    caption: "라벨링 등록 — 검수할 이미지를 선택해 등록합니다",
  },
  {
    file: "2.딥라벨로그인_watermarked.png",
    width: 1356,
    height: 746,
    alt: "DeepLabel 로그인 화면",
    caption: "DeepLabel 로그인 — 계정 정보를 입력해 라벨링 도구에 접속합니다",
  },
  {
    file: "3.딥라벨프로젝트_watermarked.png",
    width: 1354,
    height: 745,
    alt: "댐과 분석 유형별로 생성된 DeepLabel 프로젝트 목록",
    caption: "Project 선택 — 댐과 분석 유형에 맞는 프로젝트를 확인합니다",
  },
  {
    file: "4.딥라벨태스크_watermarked.png",
    width: 1349,
    height: 743,
    alt: "보령댐 6대결함 프로젝트의 결함 라벨과 촬영일자·부재 정보가 포함된 Task 목록",
    caption: "Task 선택 — 프로젝트 하위 작업을 확인하고 Open으로 진입합니다",
  },
  {
    file: "5.딥라벨잡_watermarked.png",
    width: 1356,
    height: 746,
    alt: "Task 하위 Job의 담당자, 작업 단계, 상태와 프레임 정보를 보여주는 화면",
    caption: "Job 선택 — 담당자와 작업 상태를 확인하고 라벨링 작업을 엽니다",
  },
  {
    file: "6.딥라벨편집화면_watermarked.png",
    width: 1625,
    height: 867,
    alt: "댐 이미지 위 결함 폴리곤과 박리·박락 등 객체 라벨을 확인하는 편집 화면",
    caption: "라벨 검수·편집 — 결함 영역과 객체별 라벨을 확인하고 수정합니다",
  },
  {
    file: "7.딥라벨Export메뉴_watermarked.png",
    width: 1375,
    height: 745,
    alt: "편집 화면의 좌측 상단 메뉴에서 Export job dataset을 선택하는 화면",
    caption: "Export 메뉴 진입 — 검수한 Job의 Export job dataset을 선택합니다",
  },
  {
    file: "8.딥라벨cvat커스텀기능_watermarked.png",
    width: 1357,
    height: 746,
    alt: "Export format에 추가된 AI분석 검출이미지 수정과 아스팔트·콘크리트·필 AI학습 원본데이터 추가 옵션",
    caption: "맞춤 Export 선택 — 검출이미지 수정 또는 댐 속성별 AI학습 원본데이터 추가 기능을 선택합니다",
  },
];

const gallery = (start, end) =>
  screens.slice(start, end).map((screen) => ({
    image: screen.file,
    width: screen.width,
    height: screen.height,
    alt: screen.alt,
    caption: screen.caption,
  }));

const history = [
  {
    period: "2024.11~12",
    description:
      "관리자 생성 스크립트, 포트·환경변수 설정, Export 개발 및 복구, 결함 색상 반영",
  },
  {
    period: "2024.12",
    description: "Export 한글 지원, 한글 폰트 추가, 라벨·캡션 표시 개선",
  },
  {
    period: "2025.01~02",
    description:
      "AI Pipeline Export 추가, 중복 촬영일·스테이션 데이터 덮어쓰기 방지, 원본·GT·썸네일·어노테이션 확인 로직 보강",
  },
  {
    period: "2025.02~04",
    description: "생성·삭제·관리자 관련 UI 제거 후 프로젝트 삭제 기능 복구",
  },
  {
    period: "2025.03~05",
    description:
      "운영 배포 설정, 공유 폴더·마운트 변경, API 호출 수정, 누수 카테고리 참조 오류 수정 및 처리 지연 조정",
  },
  {
    period: "2025.05",
    description: "Docker 백업·빌드 및 변경 커밋 추출 스크립트 보강",
  },
  {
    period: "2025.06~07",
    description:
      "AI 분석 이미지 Export 경로·메뉴명 변경, 아스팔트 댐마루 학습 데이터 Export 추가, 저장 폴더명 변경",
  },
  {
    period: "2025.11~2026.04",
    description:
      "NAS·로컬 포트 설정 수정, Linux 빌드 대응, Docker Compose 실행 방식 조정",
  },
  {
    period: "2026.06",
    description: "사용자별 AI학습 Export 메뉴 제한 및 디버깅 로그 추가",
  },
].reverse();

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
    title: "진단 이미지 등록부터 결함 라벨 검수·편집까지",
    description:
      "결함 검출 결과에서 검수할 이미지를 선택해 ‘라벨링 등록’을 진행하고 DeepLabel에 로그인합니다. Project → Task → Job 순서로 작업을 찾아 편집 화면에서 결함 영역과 라벨을 확인·수정합니다.",
    points: [
      "댐과 분석 유형별 Project를 선택하고, 촬영일자·부재 정보가 포함된 Task를 엽니다.",
      "Task 하위 Job에서 담당자, 작업 단계와 상태를 확인한 뒤 라벨링 편집 화면으로 이동합니다.",
      "원본 이미지 위 결함 폴리곤과 객체 목록을 함께 보며 박리·박락 등 결함 라벨과 영역을 검수합니다.",
    ],
    imageLayout: "gallery",
    images: gallery(0, 6),
  },
  {
    id: "export",
    label: "AI 데이터 Export",
    title: "맞춤 Export로 검출이미지 수정과 AI 학습 데이터를 연결",
    description:
      "라벨 검수를 마친 뒤 편집 화면 좌측 상단 메뉴에서 ‘Export job dataset’을 선택합니다. 기본 CVAT 출력 형식에 추가한 맞춤 기능으로 AI분석 검출이미지를 수정하거나, 댐 속성에 맞는 AI학습 원본데이터를 추가합니다.",
    points: [
      "‘AI분석 검출이미지 수정’으로 검수 결과를 분석 이미지에 반영하는 흐름을 연결했습니다.",
      "‘AI학습 원본데이터 추가’는 아스팔트·콘크리트·필 유형으로 구분해 댐 속성에 맞게 선택합니다.",
      "원본 이미지·GT·썸네일·어노테이션 확인 로직과 촬영일·스테이션 중복 데이터의 덮어쓰기 방지 처리를 보강했습니다.",
      "출력한 학습 데이터는 AI 모델 설정과 데이터 전처리 과정으로 이어집니다.",
    ],
    imageLayout: "gallery",
    images: gallery(6, 8),
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
