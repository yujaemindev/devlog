<template>
  <main class="mx-auto max-w-5xl px-4 pb-12 sm:px-6 xl:px-0">
    <header class="py-8">
      <p class="mb-3 text-sm font-semibold tracking-widest text-indigo-600">
        EXPERIENCE / PROTOTYPE DEVELOPMENT
      </p>
      <h1 class="text-3xl font-bold text-gray-900">
        프로토타입으로 구체화하는 서비스
      </h1>
      <p class="mt-3 leading-7 text-gray-600">
        소방방재청 정부과제를 위한 소방 지휘 통합관제 프로토타입을 제작했습니다.
        드론 운용정보, AI 탐지, GIS, 위험 알림을 한 화면에서 연결해 지휘관이
        현장 상황을 파악하고 바로 판단할 수 있도록 구성했습니다.
      </p>
      <p class="mt-3 leading-7 text-gray-600">
        아래 데모에서는 모의 데이터를 이용해 화면과 주요 조작을 체험할 수
        있습니다.
      </p>
      <a
        :href="demoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-flex font-semibold text-indigo-600 underline underline-offset-4"
      >새 탭에서 넓게 보기 ↗</a>
    </header>
    <iframe
      :src="demoUrl"
      title="딥인스펙터 소방지휘 인터랙티브 데모"
      allow="fullscreen"
      class="h-[85vh] min-h-[640px] w-full rounded-2xl border border-gray-200 bg-gray-950"
    />
    <section
      class="mt-12"
      aria-labelledby="features-title"
    >
      <h2
        id="features-title"
        class="text-2xl font-bold text-gray-900"
      >
        주요 기능
      </h2>
      <p class="mt-3 leading-7 text-gray-600">
        정부과제 프로토타입의 화면별 구성 범위와 주요 표시 데이터, 인터랙션을
        정리했습니다.
      </p>
      <div class="mt-5 overflow-x-auto rounded-2xl border border-gray-200">
        <table class="w-full min-w-[1000px] text-left text-sm leading-6">
          <caption class="sr-only">
            소방 지휘 통합관제 프로토타입 주요 기능
          </caption>
          <thead class="border-b border-gray-200 bg-gray-50 text-gray-900">
            <tr>
              <th
                scope="col"
                class="px-5 py-4 whitespace-nowrap"
              >
                화면/영역
              </th>
              <th
                scope="col"
                class="px-5 py-4"
              >
                프로토타입에 넣을 내용
              </th>
              <th
                scope="col"
                class="px-5 py-4"
              >
                주요 표시 데이터
              </th>
              <th
                scope="col"
                class="px-5 py-4"
              >
                주요 인터랙션
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white text-gray-600">
            <tr
              v-for="feature in features"
              :key="feature.area"
            >
              <th
                scope="row"
                class="px-5 py-4 align-top font-semibold whitespace-nowrap text-gray-900"
              >
                {{ feature.area }}
              </th>
              <td class="px-5 py-4 align-top">
                {{ feature.content }}
              </td>
              <td class="px-5 py-4 align-top">
                {{ feature.data }}
              </td>
              <td class="px-5 py-4 align-top">
                {{ feature.interaction }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const runtimeConfig = useRuntimeConfig();
const demoUrl = `${runtimeConfig.app.baseURL}demos/fire-command-center/index.html`;

const features = [
  {
    area: "통합관제 메인",
    content: "한 화면에 영상·지도·드론·이벤트를 통합",
    data: "현재 재난명, 위치, 상황등급, 투입 드론 수, 발생 이벤트 수",
    interaction: "각 영역 클릭 시 상세정보 연동",
  },
  {
    area: "재난현장 선택",
    content: "현재 관제 중인 화재/재난 현장 선택",
    data: "재난명, 주소, 발생시간, 현장 상태",
    interaction: "현장 변경 시 영상·지도·드론·알림 전체 변경",
  },
  {
    area: "드론 목록",
    content: "현장에 투입된 여러 드론 상태 표시",
    data: "드론명/ID, 비행상태, 고도, 속도, 배터리, GPS, 통신상태",
    interaction: "드론 선택 → 영상·GIS·AI 결과 함께 변경",
  },
  {
    area: "실시간 드론 영상",
    content: "RGB 영상 및 열화상 영상",
    data: "카메라 영상, 드론명, 촬영시간",
    interaction: "RGB ↔ 열화상 전환, 전체화면",
  },
  {
    area: "AI 객체 탐지",
    content: "영상 위 탐지결과 Overlay",
    data: "사람, 화재, 연기, 차량, 위험물, Bounding Box, Confidence",
    interaction: "객체 클릭 → 상세정보",
  },
  {
    area: "GIS 지도",
    content: "드론과 AI 탐지 객체 위치를 지도상 표출",
    data: "드론 위치/방향, 객체 위치, 위·경도, 이동경로",
    interaction: "드론 선택 시 지도 중심 이동, 객체 클릭",
  },
  {
    area: "상황 이벤트/알림",
    content: "지휘관이 바로 확인할 위험 이벤트",
    data: "발생시간, 종류, 위치, 드론, 위험등급, 신뢰도",
    interaction: "이벤트 클릭 → 지도 + 영상 해당 객체 이동",
  },
  {
    area: "AI 객체 상세",
    content: "선택 객체의 판단 근거 확인",
    data: "종류, 좌표, Confidence, 거리, 위험도, 탐지시간, 탐지 드론",
    interaction: "영상/지도에서 동일 객체 강조",
  },
  {
    area: "드론 상세정보",
    content: "선택한 기체의 상세 운용상태",
    data: "위치, 고도, 속도, 방향, 배터리, 통신, 센서 상태",
    interaction: "지도 위치 이동, 영상 선택",
  },
  {
    area: "임무/추적 제어",
    content: "AI 객체 선택 후 재확인/추적",
    data: "선택 객체, 추적 상태, 짐벌 상태",
    interaction: "객체 선택 → 짐벌 추적/해제",
  },
  {
    area: "위험상황 변화",
    content: "단순 탐지가 아닌 상태 변화 표현",
    data: "인명 이동, 화재영역 증가, 연기 확산방향, 위험물 이상",
    interaction: "변화 전/후 비교",
  },
  {
    area: "이벤트 이력",
    content: "이전 탐지 및 작전 기록 조회",
    data: "시간, 이벤트 유형, 위험도, 처리상태",
    interaction: "시간/객체/위험도 필터",
  },
  {
    area: "스냅샷/증거정보",
    content: "이벤트 발생 당시 근거 영상 보존",
    data: "탐지 이미지, 좌표, 시간, AI 결과",
    interaction: "원본 영상/이미지 확인",
  },
  {
    area: "시스템 상태",
    content: "GCS·드론·AI·영상 연결상태",
    data: "GCS 연결, 영상수신, AI 상태, GPS, API 상태",
    interaction: "장애 발생 시 경고 표시",
  },
  {
    area: "외부 시스템 연계",
    content: "P119 등 외부 시스템 연계 상태",
    data: "API 연결상태, 최근 송수신, 데이터 종류",
    interaction: "테스트 전송/연계 결과 확인",
  },
  {
    area: "사용자/권한",
    content: "관리자·지휘관 등 역할별 접근",
    data: "사용자, 역할, 접속상태",
    interaction: "권한에 따른 기능 노출",
  },
  {
    area: "작전 보고/기록",
    content: "주요 상황을 사후 보고할 수 있도록 구성",
    data: "이벤트 타임라인, 스냅샷, 드론 기록",
    interaction: "보고자료 생성/조회",
  },
];

useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · Prototype Development`,
  description:
    "소방방재청 정부과제를 위해 드론 운용정보, AI 탐지, GIS, 위험 알림을 한 화면에 연결한 소방 지휘 통합관제 프로토타입",
});
</script>
