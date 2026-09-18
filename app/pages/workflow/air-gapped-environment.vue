<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      label="AIR-GAPPED ENVIRONMENT"
      title="폐쇄망 환경을 위한 빌드·설치·실행 자동화"
    >
      외부 네트워크 접근이 제한된 환경에서 DeepInspector를 설치하고 구동할 수
      있도록 배포 패키지 생성부터 전자서명 검증, 설치와 실행까지의 과정을
      스크립트로 구성했습니다. Windows 배치와 PowerShell을 연결해 여러 서비스를
      같은 버전으로 준비하고, 현장 설치 절차를 일관되게 수행하도록 정리했습니다.
      설치 담당자가 참고할 수 있도록 별도의 설치 가이드도 함께 제공합니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="폐쇄망 배포 과정"
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

    <section
      class="mt-10 overflow-hidden rounded-2xl border border-gray-200"
      aria-labelledby="offline-scripts-title"
    >
      <h2
        id="offline-scripts-title"
        class="bg-gray-50 px-5 py-4 text-lg font-bold text-gray-900"
      >
        단계별 스크립트 역할
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-y border-gray-200 bg-gray-50 text-gray-700">
            <tr>
              <th scope="col" class="px-5 py-3">스크립트</th>
              <th scope="col" class="px-5 py-3">처리 내용</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-600">
            <tr v-for="script in scripts" :key="script.name">
              <th
                scope="row"
                class="whitespace-nowrap px-5 py-3 font-mono font-medium text-gray-900"
              >
                {{ script.name }}
              </th>
              <td class="px-5 py-3 leading-6">{{ script.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <WorkflowAside title="설치와 재실행을 분리한 현장 운영 절차">
      빌드, 설치, 실행을 각각의 진입점으로 나누어 배포 버전을 맞추고 작업 단계별
      오류를 확인할 수 있도록 했습니다. 최초 설치 후에는 설치된 컨테이너와
      보고서 프로그램을 실행 스크립트로 다시 구동할 수 있습니다. 설치 전 Docker
      환경과 반입 파일을 확인하고, 구동 후 실제 기능 검증은 통합테스트로
      이어지는 방식입니다.
    </WorkflowAside>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);
useSeoMeta({
  title: `${siteMetaInfo.title} | Workflow · Air-Gapped Environment`,
  description:
    "DeepInspector의 폐쇄망 배포를 위한 버전별 빌드, Cosign 전자서명 검증, 설치 및 서비스 실행 자동화 경험",
});

const steps = [
  {
    id: "build",
    label: "배포 패키지 빌드",
    title: "여러 서비스의 산출물을 같은 버전으로 준비합니다",
    description:
      "통합 빌드 스크립트에서 역할이 분리된 각각의 서버별 프로젝트(ex/ Frontend server, API server, Worker server, AI 기능별 서버 등)의 개별 PowerShell 빌드 스크립트를 순차 호출합니다. 전달받은 버전을 공통으로 적용하고 생성된 ZIP 파일을 하나의 outputs 폴더로 모읍니다.",
    points: [
      "한글 문서 자동화 같이 Windows OS의 환경을 직접 사용하는 서버는 PyInstaller로 단일 실행 파일을 만들고, 생성에 필요한 모듈과 리소스를 포함하도록 구성했습니다.",
      "서비스별 ZIP과 보고서 실행 파일의 이름에 버전을 포함해 설치 대상과 빌드 결과를 맞췄습니다.",
      "빌드 스크립트와 산출물의 존재 여부, 명령의 종료 코드를 확인하고 실패 시 다음 단계로 진행하지 않도록 했습니다.",
    ],
  },
  {
    id: "signature",
    label: "전자서명 검증",
    title: "설치 전에 배포 파일의 서명을 검증합니다",
    description:
      "빌드한 ZIP과 실행 파일에 Cosign으로 서명하고 파일별 .sig를 생성합니다. 설치 환경에서는 공개키로 각 파일을 검증하며, 서명 검증이 실패하면 설치를 중단하도록 구성했습니다.",
    points: [
      "빌드 단계에서 로컬 서명키를 사용하고, 설치 단계에서는 공개키와 서명 파일로 검증하도록 역할을 나눴습니다.",
      "폐쇄망에서 검증할 수 있도록 온라인 투명성 로그 조회에 의존하지 않는 공개키 기반 검증 흐름을 적용했습니다.",
      "검증 도구와 공개키, 서비스별 패키지 및 서명 파일이 준비되어 있는지 확인한 뒤 기존 서비스 중지와 설치를 진행합니다.",
    ],
  },
  {
    id: "installation",
    label: "폐쇄망 설치",
    title: "실행 환경을 확인하고 서비스별 설치를 연결합니다",
    description:
      "Windows 환경에서 Docker 명령과 엔진 상태를 먼저 확인합니다. 엔진이 실행 중이지 않으면 설치된 Docker Desktop을 시작하고 최대 120초 동안 준비를 기다린 뒤, 패키지를 해제하고 개별 설치 스크립트를 호출합니다.",
    points: [
      "기존 프로세스와 관련 컨테이너를 중지하고 패키지 해제 경로를 정리합니다.",
      "각각의 서버들이 정해진 순서대로 설치됩니다.",
      "Docker Desktop은 사전 설치를 전제로 하며, 필요한 파일 누락이나 설치 단계 실패를 확인하면 오류를 알리고 중단합니다.",
    ],
  },
  {
    id: "data",
    label: "데이터 환경 구성",
    title: "공통 데이터 경로와 초기 데이터 구성을 연결합니다",
    description:
      "설치 과정에서 공통 데이터 폴더 경로를 선택하고 각각의 서버 설치 스크립트에 마운트 경로를 전달합니다. 현장 환경에 맞는 저장 위치를 지정하고 서비스가 사용할 데이터 구성을 준비하도록 했습니다.",
    points: [
      "산출물 관리를 위한 공통 데이터 폴더 경로를 선택하면 AI 기능을 위한 weights 폴더에 모델 가중치를 복사합니다.",
      "서비스 설치 후 MySQL 컨테이너에 init.sql을 실행하고, 성공하면 전체 실행 스크립트를 호출합니다.",
    ],
  },
  {
    id: "startup",
    label: "서비스 실행",
    title: "설치된 컨테이너와 보고서 프로그램을 다시 구동합니다",
    description:
      "실행 스크립트는 Docker 엔진 준비 상태를 확인하고 기존 프로세스와 컨테이너를 중지한 뒤 재기동합니다. 설치와 실행을 분리해 패키지를 다시 설치하지 않고 서비스를 재실행할 수 있도록 구성했습니다.",
    points: [
      "Worker 컨테이너에서 호출하는 AI 프로그램들은 여러 컨테이너를 생성하여 필요시 동시에 작업할 수 있도록 했습니다.",
      "PyInstaller로 생성되는 exe 파일로 실행하는 경우, 실행 전 전용 임시 폴더를 정리하고, 선택한 버전의 실행 파일을 시작합니다.",
      "컨테이너 시작과 프로세스 실행 단계의 실패를 확인하며, 실제 서비스 응답과 기능 정상 여부는 별도 검증 대상으로 구분합니다.",
    ],
  },
  {
    id: "installation-guide",
    label: "설치 가이드",
    title: "현장 설치를 위한 별도의 가이드도 제공합니다",
    description:
      "설치 담당자가 절차를 따라 진행할 수 있도록 별도의 설치 가이드를 함께 제공합니다. 사전 준비 사항과 배포 파일 확인부터 배치 파일 실행, 공통 데이터 폴더 선택, 서비스 설치 진행 화면까지 이미지와 함께 안내합니다.",
    images: [
      {
        image: "offline-installation-guide-1.png",
        width: 904,
        height: 818,
        alt: "Docker와 WSL 준비 사항, 배포 파일 구성 및 설치 배치 파일 실행 절차를 안내하는 설치 가이드",
        caption: "설치 가이드 1 — 사전 준비 사항과 배포 파일 확인, 설치 시작 절차",
      },
      {
        image: "offline-installation-guide-2.png",
        width: 694,
        height: 709,
        alt: "공통 데이터 폴더 선택 창과 서비스별 설치 진행 로그를 보여주는 설치 가이드",
        caption: "설치 가이드 2 — 공통 데이터 폴더 선택과 서비스 설치 진행 화면",
      },
    ],
  },
];

const scripts = [
  {
    name: "build-all-offline.bat",
    description: "서비스별 빌드 호출 → 버전별 산출물 취합 → Cosign 서명 생성",
  },
  {
    name: "install-all-offline.bat",
    description:
      "Docker 확인 → 서명 검증 → 기존 서비스 중지 → 경로·가중치 준비 → 설치 → SQL 실행 → 서비스 시작",
  },
  {
    name: "start-all-offline.bat",
    description:
      "Docker 확인 → 기존 서비스 중지 → 설치된 컨테이너 재기동 → StateReport 실행",
  },
];
</script>
