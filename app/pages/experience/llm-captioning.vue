<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': sectionOffset + 'px' }"
  >
    <WorkflowPageHeader
      category="EXPERIENCE"
      label="LLM-BASED INSPECTION"
      title="YOLO와 Qwen VLM을 연계한 안전진단 문장 자동화"
    >
      시설물 점검 이미지에서 탐지된 결함을 사람이 이해할 수 있는 안전진단
      문장으로 연결하는 기능을 다뤘습니다. YOLO의 결함 탐지 결과와 위치 정보를
      Qwen 기반 Vision-Language Model에 전달하고, 구조물 재질별 프롬프트와
      출력 검증 로직을 적용하여 결함별 관찰 내용과 추정 원인을 정형화했습니다.
      AI 모델을 업무 시스템에 통합할 때 필요한 추론·예외 처리·품질 평가 경험을
      정리했습니다.
    </WorkflowPageHeader>

    <section
      class="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
      aria-labelledby="captioning-flow-title"
    >
      <h2
        id="captioning-flow-title"
        class="text-lg font-bold text-gray-900"
      >
        AI 추론 파이프라인
      </h2>
      <p class="mt-2 text-sm leading-7 text-gray-600">
        탐지 모델의 결과를 멀티모달 입력으로 가공하고, 검증을 통과한 문장만
        백엔드에 전달하는 구조입니다.
      </p>
      <figure class="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <a
          :href="architectureImage"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YOLO–Qwen 상태평가 문장 생성 아키텍처 원본 보기 (새 탭)"
          class="block"
        >
          <img
            :src="architectureImage"
            alt="시설물 이미지 입력부터 YOLO 결함 영역 추출, 위치 분석, 프롬프트 구성, Qwen VLM 추론, 출력 검증까지 이어지는 처리 구조"
            loading="lazy"
            class="block h-auto w-full"
          >
        </a>
        <figcaption class="border-t border-gray-200 px-4 py-3 text-sm leading-6 text-gray-600">
          YOLO–Qwen 기반 상태평가 문장 생성 아키텍처 · 이미지를 누르면 원본 크기로 볼 수 있습니다.
        </figcaption>
      </figure>
      <ol class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(item, index) in pipeline"
          :key="item.title"
          class="rounded-xl border border-gray-200 bg-white p-4"
        >
          <p class="text-xs font-bold tracking-wider text-indigo-600">
            STEP {{ String(index + 1).padStart(2, "0") }}
          </p>
          <h3 class="mt-2 font-bold text-gray-900">
            {{ item.title }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            {{ item.description }}
          </p>
        </li>
      </ol>
    </section>

    <WorkflowStepNav
      :steps="steps"
      label="LLM 기반 상태평가 문장 자동화 경험 목차"
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
          v-if="step.id === 'material-prompt'"
          class="grid gap-3 sm:ml-14 sm:grid-cols-2"
        >
          <article
            v-for="material in materials"
            :key="material.code"
            class="rounded-xl border border-gray-200 p-4"
          >
            <h3 class="font-semibold text-gray-900">
              {{ material.title }}
            </h3>
            <p class="mt-1 break-all font-mono text-xs text-indigo-600">
              {{ material.code }}
            </p>
            <p class="mt-3 text-sm leading-6 text-gray-600">
              {{ material.description }}
            </p>
          </article>
        </div>

        <div
          v-if="step.id === 'validation'"
          class="overflow-x-auto rounded-xl border border-gray-200 sm:ml-14"
          role="region"
          aria-label="LLM 출력 검증 항목"
          tabindex="0"
        >
          <table class="w-full min-w-[620px] text-left text-sm">
            <caption class="sr-only">
              출력의 형태 및 누락을 점검하는 6단계 검증 기준
            </caption>
            <thead class="bg-gray-50 text-gray-900">
              <tr>
                <th scope="col" class="px-4 py-3">단계</th>
                <th scope="col" class="px-4 py-3">검증 내용</th>
                <th scope="col" class="px-4 py-3">실패 처리</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-600">
              <tr v-for="item in validationChecks" :key="item.number">
                <th scope="row" class="px-4 py-3 text-gray-900">
                  {{ item.number }}
                </th>
                <td class="px-4 py-3">{{ item.check }}</td>
                <td class="px-4 py-3">{{ item.action }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="step.id === 'report'"
          class="rounded-xl border border-gray-200 bg-gray-50 p-5 sm:ml-14"
        >
          <h3 class="font-bold text-gray-900">
            결과 문장 예시 (설명을 위해 축약)
          </h3>
          <p class="mt-3 text-sm leading-7 text-gray-700">
            <strong>백태:</strong> 좌측상단 / 콘크리트 표면에 백색 침전물이
            관찰되는 모양이기에 백태로 추정되며, 이는 수분 침투와 콘크리트
            내부 성분의 용출 때문으로 추정됩니다.
          </p>
          <p class="mt-3 text-xs leading-6 text-gray-500">
            실제 출력은 재질별 결함 항목과 종합 의견(전체·요약)을 포함하며,
            탐지되지 않은 항목은 '발견되지 않음'으로 정리합니다.
            위 문장은 입력 데이터에 대한 실제 모델 추론 결과가 아닌 형식 예시입니다.
          </p>
        </div>
      </WorkflowSection>
    </div>

    <WorkflowAside title="AI 문장 생성과 최종 안전진단의 역할 구분">
      이 기능은 결함의 시각적 근거와 가능한 원인을 정리해 점검자의
      문서 작성을 지원합니다. 생성된 원인 설명은 추정이며, 실제 구조적 원인이나
      시설물의 상태등급을 확정하는 판정으로 취급하지 않습니다.
      업무 적용 시 원본 이미지와 탐지 결과를 함께 확인하고 전문가 검토를
      거쳐야 합니다.
    </WorkflowAside>

    <NuxtLink
      to="/experience/deep-inspector"
      class="mt-8 inline-flex font-semibold text-indigo-600 underline underline-offset-4 hover:text-indigo-800"
    >
      DeepInspector의 GS인증 및 AI 검증 경험 함께 보기 →
    </NuxtLink>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";
import { assetPath } from "@/utils/assetPath.js";

const sectionOffset = ref(171);
const runtimeConfig = useRuntimeConfig();
const architectureImage = assetPath(
  runtimeConfig.app.baseURL,
  "images/experience/llm/YOLO-Qwen_archi.png",
);

const pipeline = [
  {
    title: "시설물 이미지 분석",
    description: "YOLO Segmentation으로 균열, 누수, 백태, 박락 등 결함 영역을 탐지합니다.",
  },
  {
    title: "결함 영역 전처리",
    description: "마스크를 결합하고 10% 패딩을 적용해 이미지를 크롭·인코딩합니다.",
  },
  {
    title: "결함 위치 정량화",
    description: "Bounding Box를 3×3 격자에 매핑해 좌측상단·중앙 등 위치 정보를 생성합니다.",
  },
  {
    title: "Qwen 멀티모달 추론",
    description: "결함 이미지·라벨·위치와 재질별 프롬프트를 Qwen VLM에 함께 전달합니다.",
  },
  {
    title: "정규화·검증·재시도",
    description: "출력 항목을 검사하고 실패하면 엄격 프롬프트로 전환해 최대 3회 시도합니다.",
  },
  {
    title: "보고서 연동",
    description: "결함별 문장과 종합 의견을 텍스트로 정리하여 저장하고 백엔드에 전달합니다.",
  },
];

const steps = [
  {
    id: "problem",
    label: "도입 배경",
    title: "결함 탐지 결과를 업무에 활용할 수 있는 설명으로 확장",
    description:
      "기존 객체 탐지 모델은 이미지 내 결함의 종류와 영역을 구분하는 데 초점이 있습니다. 이를 점검 보고서 작성에 활용하려면 결함이 어디에 있고 어떤 시각적 특징을 보이는지, 가능한 원인은 무엇인지를 일관된 문장으로 정리할 필요가 있습니다.",
    points: [
      "탐지된 결함과 위치를 자연어 생성 모델이 참고할 수 있는 데이터로 구조화했습니다.",
      "이미지 전체 대신 결함 중심 크롭을 활용해 VLM이 확인할 대상을 좁혔습니다.",
      "문장 생성 자체뿐 아니라 출력 형식, 누락, 재시도와 백엔드 연동까지 파이프라인으로 구성했습니다.",
    ],
  },
  {
    id: "visual-input",
    label: "영상 전처리",
    title: "YOLO 세그멘테이션 결과를 멀티모달 입력으로 변환",
    description:
      "YOLOv8/v11 기반 Segmentation 결과에서 클래스별 마스크와 결함 영역을 추출하고, 이미지의 결함 위치와 크기에 따라 VLM 입력을 준비합니다.",
    points: [
      "슬라이딩 윈도우 방식으로 이미지를 분석하고 클래스별 결함 마스크를 병합합니다.",
      "결함 Bounding Box 주변에 10% 여유 영역을 추가하고, 이미지 경계를 넘지 않도록 좌표를 보정합니다.",
      "결함 위치를 이미지 기준 3×3 격자로 나누어 프롬프트에 전달할 위치 정보를 생성합니다.",
      "결함 수에 따라 크롭 이미지의 최대 크기를 조절하고, 이미지 파일을 별도로 저장하지 않고 Base64로 인코딩합니다.",
    ],
  },
  {
    id: "material-prompt",
    label: "프롬프트 설계",
    title: "구조물 재질과 결함 유형에 따라 프롬프트를 동적 구성",
    description:
      "InspectionPromptBuilder와 재질별 MaterialConfig를 통해 탐지 클래스명, 모범 문장 예시, 출력 항목을 구분합니다. Qwen3.5-9B-AWQ-4bit 모델을 vLLM 엔진으로 실행하고 결함 이미지를 텍스트 메타데이터와 함께 입력합니다.",
    points: [
      "콘크리트·강재와 교량·터널의 특성을 반영해 결함 분류 기준과 문장 템플릿을 분리했습니다.",
      "사전 탐지 라벨과 위치를 제공하여 '시각적 특징 → 결함 추정 → 원인 추정' 순서로 작성하도록 유도했습니다.",
      "근거 없이 원인을 단정하지 않도록 '추정됩니다'와 같은 신중한 표현을 출력 지침에 반영했습니다.",
      "탐지되지 않은 결함도 정해진 항목 안에서 '발견되지 않음'으로 표시하도록 출력 골격을 정의했습니다.",
    ],
  },
  {
    id: "validation",
    label: "출력 안정화",
    title: "LLM 응답 오류를 정규화하고 6단계로 검증",
    description:
      "생성형 모델은 정해진 양식 대신 서론, 코드 블록, 사고 과정 또는 누락된 항목을 출력할 수 있습니다. 정규식 정규화와 검증 단계를 거쳐 잘못된 출력을 업무 데이터에 그대로 반영하지 않도록 구성했습니다.",
    points: [
      "일부 표기 변형을 정규화한 뒤 필수 키와 내용이 정확히 갖추어졌는지 확인합니다.",
      "검증 실패 시 예시를 축소한 엄격 프롬프트, 보수적 샘플링, 사고 모드 비활성화로 다시 추론합니다.",
      "최대 3회 실패해도 전체 항목을 가진 폴백 텍스트를 조립하고 채우지 못한 내용은 명시적으로 표시합니다.",
      "GPU·vLLM 없이 실행하는 Mock LLM 테스트에서 사고 과정 유출, 항목 중복, 키 순서 오류, 내용 누락 등 비정상 응답을 점검합니다.",
    ],
  },
  {
    id: "report",
    label: "백엔드 연동",
    title: "생성된 분석 문장을 기존 안전진단 시스템으로 전달",
    description:
      "결함별 서술 결과와 종합 의견(전체·요약)을 정해진 순서로 조립하고, 이미지별 텍스트 결과를 저장합니다. 작업 ID와 백엔드 콜백 URL을 사용하여 기존 API와 연계합니다.",
    points: [
      "결과 데이터의 크기 제한을 검사하고 예외 상황을 로그로 확인할 수 있도록 구성했습니다.",
      "이미지 파일명과 생성 문장을 매핑하여 후속 보고서 처리 흐름에 전달합니다.",
      "추론 모델과 업무 백엔드의 역할을 분리하여 AI 기능을 기존 웹서비스에 연계했습니다.",
    ],
  },
  {
    id: "evaluation",
    label: "품질 검증",
    title: "생성 문장의 정합성과 출력 안정성을 별도로 평가",
    description:
      "형식에 맞는 출력이 곧 정확한 진단을 의미하지는 않습니다. 생성 결과와 COCO Ground Truth를 대조하는 평가 스크립트를 마련하고, 형식·재시도 로직은 독립 테스트로 검증하도록 구성했습니다.",
    points: [
      "이미지별 TXT 생성 결과와 COCO JSON 정답 데이터를 매핑하여 결함, 위치, 설명 점수를 계산합니다.",
      "위치 부합도는 3×3 격자에서 일치·인접·불일치 관계를 구분합니다.",
      "평가 스크립트는 결함 40%, 위치 40%, 설명 20%의 가중 점수를 계산하여 CSV로 출력합니다.",
      "별도 출력 형식 테스트에는 19종의 정상·고장 응답 시나리오가 포함되어 있습니다.",
      "평가 로직 구축과 실제 정확도 확보를 구분해 해석하며, 추가적인 전문가 판단은 별도로 필요합니다.",
    ],
  },
  {
    id: "takeaways",
    label: "개발 경험",
    title: "모델 호출을 넘어 AI 기능의 품질과 운영을 설계",
    description:
      "이번 기능에서 중요한 점은 LLM API를 호출하는 것 자체가 아니라 기존 Computer Vision 추론과 생성형 AI를 연결하고, 불안정한 생성 결과를 업무용 데이터 형식으로 관리하는 구조를 다룬 경험입니다.",
    points: [
      "YOLO, Qwen VLM, vLLM을 결합한 멀티모달 추론 흐름을 이해하고 시스템에 연계했습니다.",
      "재질별 설정과 프롬프트 정책을 분리하여 여러 점검 대상에 적용할 수 있는 구조를 다뤘습니다.",
      "추론 자원과 이미지 입력량을 조절하고, 출력 검증·재시도·폴백을 적용했습니다.",
      "AI 문장 생성과 최종 안전진단 판단의 책임 범위를 구분하는 관점이 중요하다는 점을 확인했습니다.",
    ],
  },
];

const materials = [
  {
    title: "교량 콘크리트",
    code: "BRIDGE_CONCRETE",
    description: "균열, 누수, 백태, 박락, 파손, 재료분리, 철근부식, 층분리",
  },
  {
    title: "교량 강재",
    code: "BRIDGE_STEEL",
    description: "균열, 부식, 파단",
  },
  {
    title: "터널 철근콘크리트",
    code: "TUNNEL_REINFORCED_CONCRETE",
    description: "균열, 누수, 백태, 박락, 파손, 재료분리, 철근부식",
  },
  {
    title: "터널 무근콘크리트",
    code: "TUNNEL_PLAIN_CONCRETE",
    description: "터널 무근콘크리트 대상 결함명 및 문장 템플릿 설정",
  },
];

const validationChecks = [
  { number: "01", check: "사고 과정 태그 종료 및 분리", action: "미종료 시 폐기" },
  { number: "02", check: "출력 텍스트 10KB 제한", action: "초과 시 폐기" },
  { number: "03", check: "첫 항목 앞 불필요한 산문 길이", action: "100자 초과 시 폐기" },
  { number: "04", check: "출력 항목 키 중복", action: "중복 시 폐기" },
  { number: "05", check: "출력 항목의 순서", action: "순서 오류 시 폐기" },
  { number: "06", check: "탐지된 결함의 실제 서술 여부", action: "누락 시 폐기" },
];

useSeoMeta({
  title: siteMetaInfo.title + " | Experience · LLM-Based Inspection",
  description:
    "YOLO 세그멘테이션과 Qwen VLM을 연계한 시설물 상태평가 문장 생성 경험: 재질별 프롬프트, vLLM 추론, 출력 검증과 평가 파이프라인",
});
</script>
