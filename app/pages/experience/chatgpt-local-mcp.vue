<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      category="EXPERIENCE"
      label="ChatGPT with Local MCP"
      title="ChatGPT와 로컬 MCP로 연결한 개발 흐름"
    >
      Codex로 전환하지 않고 ChatGPT에서 로컬 프로젝트를 다룰 수 있도록
      로컬 MCP를 구축했습니다. 플러그인 제작과 설치, 터널 연결부터 파일 조회·수정,
      개발 서버 실행과 검증, Git 커밋·푸시까지 이어지는 작업 흐름을 정리했습니다.
    </WorkflowPageHeader>
    <figure class="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <a
        :href="mcpMainImage"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ChatGPT에서 Yujaemin Local MCP 플러그인을 사용하는 화면 원본 보기 (새 탭)"
        class="block"
      >
        <img
          :src="mcpMainImage"
          alt="ChatGPT에서 Yujaemin Local MCP 플러그인을 사용하는 화면"
          class="block h-auto w-full"
        >
      </a>
      <figcaption class="border-t border-gray-200 px-4 py-3 text-sm leading-6 text-gray-600">
        ChatGPT와 로컬 MCP 플러그인을 연결해 프로젝트 파일 조회·수정부터 개발 서버와 Git 작업까지 수행하는 환경
      </figcaption>
    </figure>
    <div class="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
      <p class="text-sm font-semibold text-indigo-600">연결 구조</p>
      <ol class="mt-3 flex flex-wrap items-center gap-3 text-sm leading-6 text-gray-900" aria-label="도구 호출 경로">
        <li>ChatGPT</li>
        <li aria-hidden="true">→</li>
        <li>로컬 MCP 플러그인</li>
        <li aria-hidden="true">→</li>
        <li>OpenAI Tunnel</li>
        <li aria-hidden="true">→</li>
        <li>로컬 MCP 서버</li>
        <li aria-hidden="true">→</li>
        <li>프로젝트 파일 · npm · Git</li>
      </ol>
    </div>
    <WorkflowStepNav
      :steps="steps"
      label="로컬 MCP 개발 경험 목차"
      @offset-change="sectionOffset = $event"
    />
    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/experience/mcp"
      />
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const mcpMainImage = `${runtimeConfig.app.baseURL}images/experience/mcp/mcp메인.png`;
useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · ChatGPT with Local MCP`,
  description: "ChatGPT에서 로컬 MCP와 OpenAI Tunnel을 통해 로컬 코드 조회·수정, 개발 서버 실행, 검증, Git 커밋·푸시를 연결한 경험",
});

const steps = [
  {
    id: "purpose",
    label: "구축 목적",
    title: "대화에서 로컬 프로젝트 작업까지 연결",
    description: "ChatGPT에서 요청한 작업을 로컬 프로젝트에 반영하기 위해 프로젝트 전용 MCP를 구성했습니다. 파일을 읽고 수정하는 도구와 npm 검증, Git 작업을 제공해 대화에서 실제 개발 작업으로 이어지는 경로를 마련했습니다.",
    points: [
      "로컬 프로젝트 작업은 로컬 MCP 플러그인을 통해 수행하도록 작업 지침을 정리했습니다.",
      "README와 관련 설정을 먼저 확인하고 기존 프로젝트의 실행 방식과 코드 스타일을 따릅니다.",
      "파일 수정, 검증, 커밋, 푸시를 단계별 도구로 나누어 요청 범위에 맞게 실행합니다.",
    ],
    images: [
      {
        image: "localmcpflow.png",
        alt: "ChatGPT와 로컬 MCP를 연결한 작업 구조",
        caption: "ChatGPT 요청이 로컬 MCP와 터널을 거쳐 프로젝트 파일·npm·Git 작업으로 이어지는 전체 구조",
      },
    ],
  },
  {
    id: "plugin",
    imageLayout: "gallery",
    images: [
      {
        image: "1.준비.png",
        alt: "로컬 MCP 플러그인 제작 준비 화면",
        caption: "MCP 플러그인 제작을 위한 개발 환경과 작업 규칙 준비",
      },
      {
        image: "2.프로젝트설정.png",
        alt: "로컬 MCP 프로젝트 설정 화면",
        caption: "프로젝트 경로와 실행 스크립트 등 MCP 작업 범위 설정",
      },
      {
        image: "3.도구구현.png",
        alt: "로컬 MCP 도구 구현 화면",
        caption: "파일·Git 작업을 수행하는 로컬 MCP 도구 구현",
      },
      {
        image: "4.서버빌드.png",
        alt: "로컬 MCP 서버 빌드 및 도구 검증 화면",
        caption: "MCP 서버 빌드 후 등록된 도구가 정상 노출되는지 검증",
      },
      {
        image: "5.mcp연결설정.png",
        alt: "로컬 MCP 연결 설정 화면",
        caption: "로컬 MCP 서버를 실행하기 위한 연결 경로와 설정 구성",
      },
      {
        image: "6.플러그인등록.png",
        alt: "로컬 MCP 플러그인 등록 화면",
        caption: "완성된 MCP 구성을 ChatGPT 로컬 플러그인으로 등록",
      },
      {
        image: "7.사용확인.png",
        alt: "로컬 MCP 플러그인 사용 확인 화면",
        caption: "ChatGPT에서 로컬 MCP 도구를 불러와 실제 사용 가능 여부 확인",
      },
    ],
    label: "플러그인 제작",
    title: "MCP 서버를 설치 가능한 로컬 플러그인으로 구성",
    description: "도구를 구현한 서버를 ChatGPT에서 연결해 사용할 수 있도록 플러그인 설정과 설치 과정을 mcp-create.sh에 묶었습니다. 서버 코드 작성 → 빌드와 검증 → 연결 설정 생성 → 플러그인 등록 → 터널 연결 순서로 구성했습니다.",
    points: [
      "준비: Windows와 Git Bash 환경에서 Node.js·npm·Git을 확인하고, 필수 지침 문서 LOCAL_MCP_INSTRUCTIONS.md가 없거나 읽을 수 없으면 설치를 중단합니다.",
      "프로젝트 설정: config.json에 프로젝트 루트, 접근 허용 범위, package.json의 승인된 실행 스크립트와 Git Bash 경로를 기록합니다.",
      "도구 구현: MCP SDK의 McpServer와 표준 입출력 전송 방식을 사용하고, Zod로 각 도구의 입력 형식을 정의합니다. 도구 설명과 읽기·쓰기 특성도 함께 등록합니다.",
      "서버 빌드: MCP SDK와 Zod를 설치하고 esbuild로 서버를 번들링합니다. 소스와 빌드 결과의 문법을 확인한 뒤 테스트 클라이언트로 initialize와 tools/list를 호출해 필수 도구 등록을 검증합니다.",
      "연결 설정: .mcp.json에 Node 실행 경로와 서버 파일·작업 디렉터리를 지정하고, 프로젝트의 VS Code MCP 설정도 생성합니다.",
      "플러그인 등록: plugin.json에 이름·버전·설명·MCP 설정 위치·화면 표시 정보를 작성합니다. 로컬 Marketplace 설정을 백업한 뒤 플러그인 위치를 등록합니다.",
      "사용 확인: 터널 클라이언트를 점검·재시작하고 ChatGPT에서 도구 목록과 실제 호출 응답을 확인합니다. 업데이트한 도구가 보이지 않으면 새 대화에서도 확인합니다.",
    ],
  },
  {
    id: "tunnel",
    label: "터널 연결",
    title: "ChatGPT 도구 호출을 로컬 서버로 전달",
    description: "OpenAI Tunnel과 로컬 tunnel-client를 연결하고 로컬 MCP 플러그인을 통해 로컬 MCP 도구를 호출하는 구성을 마련했습니다. 생성 스크립트 마지막에는 터널 클라이언트의 점검과 재시작 흐름을 추가했습니다.",
    points: [
      "기존 tunnel-client 종료 → doctor 점검 → 백그라운드 실행 → 실행 여부 확인 순서로 연결을 준비합니다.",
      "터널 API 키는 코드에 하드코딩하지 않고 별도 로컬 파일에서 읽습니다.",
      "키 파일을 Git 제외 목록에 등록하고 채팅·로그·커밋에 키 값이 포함되지 않도록 관리합니다.",
      "연결 후 도구 목록을 확인해 필요한 파일·서버·Git 도구가 제공되는지 점검합니다.",
    ],
  },
  {
    id: "development",
    label: "수정과 검증",
    title: "파일 확인부터 개발 서버 실행과 검증까지",
    description: "프로젝트 구조와 실행 설정을 읽은 뒤 코드를 수정하고, 프로젝트에 정의된 검증 명령으로 결과를 확인하는 흐름을 연결했습니다. Nuxt 개발 서버는 별도 백그라운드 도구로 실행하고 상태와 로그를 조회합니다.",
    points: [
      ".nvmrc와 package.json의 Node 요구사항을 확인하고 nvm_status로 실행 환경을 점검합니다.",
      "start_dev_server로 기존 npm run dev 스크립트를 실행하고 dev_server_status로 실행 상태와 Nuxt 로그를 확인합니다.",
      "코드 변경은 lint와 typecheck, 페이지·정적 생성 변경은 generate:pages까지 확인합니다.",
      "검증 실패는 실행 환경 문제와 코드 문제를 구분해 기록하고, 성공 여부를 확인한 범위에서 결과를 보고합니다.",
    ],
  },
  {
    id: "git",
    label: "커밋과 푸시",
    title: "변경 검토 후 요청한 범위만 Git에 반영",
    description: "로컬 MCP에 Git 상태·차이 조회, 파일 추가, 커밋, 푸시 도구를 구성해 코드 변경을 저장소 반영까지 연결했습니다. 구현 작업과 원격 반영을 구분해 사용자가 요청한 단계에서 멈출 수 있도록 했습니다.",
    points: [
      "git_status와 git_diff로 기존 변경과 이번 작업의 변경을 확인합니다.",
      "검증 결과를 확인한 뒤 작업 대상 파일만 git_add로 선택합니다.",
      "git_commit으로 수정사항의 핵심을 한글 메시지로 기록합니다.",
      "git_push는 사용자가 명시적으로 요청한 경우에 실행하고 결과를 확인합니다.",
      "‘커밋·푸시 전까지’ 요청한 작업은 변경과 검증 결과를 남기고 저장소 반영 전에 멈춥니다.",
    ],
  },
  {
    id: "lessons",
    label: "운영과 개선",
    title: "새 대화에서도 이어지는 작업 지침",
    description: "도구 업데이트 후 기존 ChatGPT 세션에서 이전 스키마가 보이는 현상을 경험했습니다. 서버와 터널의 실행 상태뿐 아니라 세션에서 보이는 도구 목록도 확인하고, 새 세션에서 변경된 도구가 제공되는지 점검하는 절차를 정리했습니다.",
    points: [
      "기존 세션의 도구 스키마 캐시 가능성을 고려해 새 세션에서 도구 목록을 다시 확인합니다.",
      "프로젝트 인계 문서에 실행 방식, 키 관리, 터널 구성, 작업 범위를 기록했습니다.",
      "MCP 서버 시작 시 프로젝트의 인계 문서를 읽도록 연결해 새 대화에서도 같은 지침을 전달합니다.",
      "로컬 파일 접근과 실행 권한을 도구 단위로 정의하고 작업 결과를 단계별로 확인하는 개발 흐름을 구성했습니다.",
    ],
  },
];
</script>
