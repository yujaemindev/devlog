<template>
  <main
    class="si-project mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader
      category="EXPERIENCE"
      label="SI project"
      title="K-water 댐 안전진단 AI 플랫폼"
    >
      촬영 데이터부터 AI 결함 검출, XAI, 도면·보고서까지 연결하는 SI
      프로젝트입니다. Node.js 백엔드를 중심으로 이기종 분석 모듈을 연동하고,
      장시간 작업의 실행과 결과를 관리하는 구조를 정리합니다.
    </WorkflowPageHeader>
    <WorkflowStepNav
      :steps="steps"
      label="SI project 목차"
      @offset-change="sectionOffset = $event"
    />
    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/experience/kwater"
      >
        <div
          v-if="step.id === 'overview'"
          class="grid gap-4 sm:grid-cols-3"
        >
          <article
            v-for="item in overview"
            :key="item.title"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-5"
          >
            <h3 class="font-bold text-gray-900">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm leading-7 text-gray-600">
              {{ item.description }}
            </p>
          </article>
        </div>
        <template v-else-if="step.id === 'data-contract'">
          <div
            class="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5"
          >
            <h3 class="font-bold text-gray-900">
              댐 / 촬영일 / 처리 단계 / 부재·이미지 유형
            </h3>
            <p class="mt-3 break-all font-mono text-sm text-indigo-700">
              01SYD/20231109/stage04/045R_YSR/
            </p>
            <p class="mt-2 text-sm leading-7 text-gray-600">
              자료의 규칙을 조합한 예시입니다. 01SYD는 소양강댐 폴더, 04는 단계,
              5는 여수로, R은 RGB, YSR은 여수로 약어를 나타냅니다. 열화상은 Y,
              변형 데이터는 B로 구분합니다.
            </p>
          </div>
          <div class="overflow-x-auto rounded-2xl border border-gray-200">
            <table class="w-full text-left text-sm leading-6">
              <caption
                class="bg-gray-50 px-5 py-3 text-left font-semibold text-gray-900"
              >
                처리 단계별 데이터와 산출물
              </caption>
              <thead class="border-y border-gray-200 bg-gray-50 text-gray-900">
                <tr>
                  <th
                    scope="col"
                    class="px-5 py-3"
                  >
                    단계
                  </th>
                  <th
                    scope="col"
                    class="px-5 py-3"
                  >
                    역할
                  </th>
                  <th
                    scope="col"
                    class="px-5 py-3"
                  >
                    데이터
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 text-gray-600">
                <tr
                  v-for="stage in stages"
                  :key="stage.id"
                >
                  <th
                    scope="row"
                    class="whitespace-nowrap px-5 py-3 font-mono font-medium text-indigo-600"
                  >
                    {{ stage.id }}
                  </th>
                  <td class="px-5 py-3">
                    {{ stage.title }}
                  </td>
                  <td class="px-5 py-3">
                    {{ stage.output }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-4 text-sm leading-7 text-gray-500">
            XAI는 stage04에서 stage09·10으로 분기합니다. stage01~03의
            댐본체(DBC)는 stage04 이후 하류사면(HRM), 댐마루(DMR), 상류사면(SRM)
            등으로 세분화됩니다.
          </p>
        </template>
        <div
          v-else-if="step.id === 'learning-training'"
          class="mt-8"
        >
          <h3 class="mb-3 text-lg font-bold text-gray-900">
            학습·평가 UI
          </h3>
          <p class="mb-4 text-sm leading-7 text-gray-600">
            AI 모델 학습 설정부터 Weight 적용, 평가 데이터 관리까지의
            화면입니다. 좌우로 넘겨 확인하고, 이미지를 누르면 원본을 새 탭에서
            볼 수 있습니다.
          </p>
          <HorizontalImageGallery
            :images="trainingScreens"
            image-directory="images/experience/kwater/pipeline"
            label="K-water AI 학습·평가 UI 갤러리"
          />
        </div>
      </WorkflowSection>
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo.js";

const sectionOffset = ref(171);
useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · SI project`,
  description:
    "K-water 댐 안전진단 AI 플랫폼 SI 프로젝트. Node.js·Express·Tibero 기반 백엔드, 비동기 스케줄러, 진단 데이터 규칙과 AI 학습·보고서 연동 구조를 정리합니다.",
});

const trainingScreens = [
  [3, "콘크리트댐 · AI 모델 학습 설정"],
  [4, "콘크리트댐 · 학습 설정 재진입"],
  [5, "콘크리트댐 · 원본 데이터 미리보기"],
  [6, "콘크리트댐 · 전처리 실행"],
  [7, "콘크리트댐 · 전처리 필수 입력 확인"],
  [8, "콘크리트댐 · 학습 시작"],
  [9, "콘크리트댐 · 학습 필수 입력 확인"],
  [10, "콘크리트댐 · Weight 등록"],
  [11, "콘크리트댐 · Weight 등록 확인"],
  [12, "콘크리트댐 · 모델 선택 확인"],
  [13, "콘크리트댐 · Weight 삭제"],
  [14, "콘크리트댐 · Weight 삭제 확인"],
  [15, "필댐 · 원본 데이터 미리보기"],
  [16, "필댐 · 전처리 실행"],
  [17, "필댐 · 학습 시작"],
  [18, "필댐 · Weight 등록"],
  [19, "필댐 · Weight 등록 확인"],
  [20, "필댐 · Weight 삭제"],
  [21, "필댐 · Weight 삭제 확인"],
  [23, "콘크리트댐 · AI 모델 선택 초기 화면"],
  [24, "콘크리트댐 · AI 모델 선택 재진입"],
  [25, "콘크리트댐 · Weight 정렬 기준 선택"],
  [26, "콘크리트댐 · 결함 검출 모델 선택"],
  [27, "콘크리트댐 · Weight 다운로드"],
  [28, "콘크리트댐 · Weight 적용"],
  [29, "콘크리트댐 · Weight 적용 확인"],
  [30, "콘크리트댐 · 모델 선택 화면에서 삭제"],
  [31, "콘크리트댐 · 삭제 확인"],
  [32, "필댐 · Weight 정렬 기준 선택"],
  [33, "필댐 · 결함 검출 모델 선택"],
  [34, "필댐 · 모델 선택 화면에서 삭제"],
  [35, "필댐 · Weight 적용"],
  [36, "AI 모델 평가자료 관리 · 화면 안내"],
  [37, "평가자료 관리 · 초기 화면"],
  [38, "평가자료 관리 · 재진입"],
  [39, "평가자료 관리 · 데이터 삭제"],
  [40, "평가자료 관리 · 신규 Test Data 생성"],
  [41, "평가자료 관리 · Test Data 적용"],
  [42, "평가자료 관리 · 적용 확인"],
  [43, "평가자료 관리 · 데이터 삭제 확인"],
  [44, "평가자료 관리 · 신규 Test Data 생성 확인"],
].map(([number, caption]) => ({
  image: `slide_${String(number).padStart(3, "0")}.png`,
  width: 1601,
  height: 900,
  alt: `K-water ${caption} UI`,
  caption,
}));

const overview = [
  {
    title: "백엔드 · 데이터",
    description:
      "Node.js·Express REST API, Swagger 문서화, Tibero 7과 JDBC Connection Pool, NAS 기반 공유 스토리지",
  },
  {
    title: "비동기 실행",
    description:
      "DB 작업 Queue, Node Cluster Master/Worker, child_process.spawn을 통한 외부 실행파일 제어",
  },
  {
    title: "업무 시스템 연동",
    description:
      "Windows AI·후처리 모듈, Linux 기반 학습 환경, 라벨링 프로그램, K-water 알람 API 연계",
  },
];

const stages = [
  { id: "stage01", title: "촬영 원본", output: "드론 RGB·열화상 영상" },
  { id: "stage02", title: "원본 필터링", output: "필터링된 촬영 데이터" },
  { id: "stage03", title: "3D 모델링", output: "3D Mesh Model" },
  { id: "stage04", title: "진단 입력", output: "입면정사영상·포인트 클라우드" },
  { id: "stage05", title: "결함 검출", output: "RGB 결함·누수·변형 검출 결과" },
  { id: "stage06", title: "결함 측정", output: "결함 측정 및 후처리 결과" },
  { id: "stage07", title: "외관조사망도", output: "결함 위치를 반영한 도면" },
  { id: "stage08", title: "상태평가보고서", output: "상태평가 및 보고서" },
  { id: "stage09", title: "XAI HeatMap", output: "RGB 영상 기반 설명 시각화" },
  { id: "stage10", title: "XAI Captioning", output: "RGB 영상 기반 설명 결과" },
];

const steps = [
  {
    id: "overview",
    label: "프로젝트 개요",
    title: "안전진단 업무를 하나의 처리 흐름으로 연결",
    description:
      "댐 프로젝트와 촬영 데이터를 관리하고, AI 분석 요청부터 결과 조회·도면·보고서 생성까지 연결하는 백엔드입니다. 모델 실행 환경과 파일 경로, 작업 상태를 조율해 서로 다른 분석 프로그램을 웹 기반 진단 업무에 통합합니다.",
    points: [
      "콘크리트의 균열·박리·박락·철근노출·누수·백태, 필댐의 누수·변형, 아스팔트 결함을 다룹니다.",
      "백엔드 개발 범위의 핵심은 API, 비동기 실행 제어, 결과·파일 관리와 외부 시스템 연동입니다.",
    ],
  },
  {
    id: "architecture",
    label: "시스템 구성",
    title: "API·데이터베이스·외부 분석 모듈의 역할 분리",
    description:
      "Nginx를 거친 요청을 Express API에서 처리하고, 프로젝트·결함·작업 상태는 Tibero에 저장합니다. 대용량 이미지와 JSON, 도면, 보고서는 공유 스토리지에서 관리하며 Worker가 외부 AI·후처리 프로그램을 실행합니다.",
    points: [
      "Controller–Service–Repository 구조와 기존 Model·파일 처리 경로가 공존하는 백엔드입니다.",
      "Node.js는 입력·출력 경로와 모델 Weight를 결정하고, YOLO·Mask R-CNN·HRNet·Meta-learning 등의 실행 모듈을 연결합니다.",
    ],
    images: [
      {
        image: "kwater_architecture.png",
        width: 1377,
        height: 1158,
        alt: "Express API와 Tibero, NAS, Cluster Worker, 외부 AI 실행파일 및 라벨링 프로그램 연결 구성도",
        caption: "시스템 구성 — API 요청, 작업 실행, 데이터 저장과 외부 연동",
      },
    ],
  },
  {
    id: "database",
    label: "Database",
    title: "Database · 댐·진단 결과·작업 상태를 연결하는 데이터 구조",
    description:
      "Tibero 기반으로 댐과 부재, 촬영·진단 프로젝트, 결함 결과와 상태평가를 연결합니다. 업무 데이터뿐 아니라 AI 실행을 위한 작업 종류, Worker 상태, 작업 Queue와 상태 변경 이력도 DB에서 관리합니다. 대용량 이미지와 산출물은 공유 스토리지에 두고 DB의 프로젝트·경로·상태 정보와 연결합니다.",
    points: [
      "진단 대상: 댐·부재·스테이션 정보를 기준으로 촬영 데이터와 결함 검출·측정 결과를 연결합니다.",
      "결과 관리: 결함 유형과 위치, 상태평가 정보 및 이미지 처리 프로젝트의 진행 정보를 관리합니다.",
      "비동기 작업: TM_AN10017은 작업 종류, TM_AN10018은 Worker 상태, TM_AN10019는 작업 Queue, TM_AN10020은 작업 상태 변경 이력을 관리합니다.",
      "운영·권한: 사용자·권한·메뉴·화면 관련 테이블을 업무 데이터와 함께 구성합니다.",
    ],
    images: [
      {
        image: "erd_50pct.webp",
        width: 4652,
        height: 4112,
        alt: "K-water 댐·부재·스테이션, 결함 및 상태평가, 작업 스케줄·Worker·이력, 이미지 처리 프로젝트와 사용자 권한 테이블의 ERD",
        caption:
          "K-water Database ERD — 진단 대상, 분석 결과와 작업 관리 테이블의 관계",
      },
    ],
  },
  {
    id: "scheduler",
    label: "비동기 스케줄러",
    title: "DB Queue와 Worker로 장시간 AI 작업 관리",
    description:
      "분석 요청은 DB에 PENDING 작업과 상태 이력으로 등록합니다. Master는 약 10초 간격으로 대기 작업과 가용 Worker를 조회하고, 오래된 작업부터 IPC 메시지로 실행을 배정합니다. 코드상 기본 Worker 수는 10개입니다.",
    points: [
      "동일 작업 종류가 RUNNING이면 해당 종류의 신규 실행을 건너뛰어 같은 AI 모듈의 동시 실행을 제한합니다.",
      "Worker는 외부 프로세스의 stdout·stderr, 종료 코드와 후처리 결과를 확인하고 RUNNING → COMPLETE 또는 FAILED로 상태를 갱신합니다.",
      "비정상 종료된 Worker는 재생성하며, 서버 기동 시 남아 있는 RUNNING 작업은 FAILED로 정리합니다. 작업을 자동 재시도하는 동작과는 구분됩니다.",
      "DB에 작업과 이력이 남아 상태 조회가 쉽지만, Polling 부하와 작업 동시성 제어를 함께 고려해야 합니다.",
    ],
    images: [
      {
        image: "kwater_scheduler.png",
        width: 2451,
        height: 2554,
        alt: "작업 등록, 중복 실행 확인, Worker 배정, 실행 완료와 실패 이력 저장을 보여주는 스케줄러 설계도",
        caption:
          "스케줄러 설계 — 작업 등록과 실행 흐름. 메모리 확인은 설계 자료의 검토 항목입니다.",
      },
    ],
  },
  {
    id: "data-contract",
    label: "데이터 규칙",
    title: "폴더와 코드 규칙을 모듈 간 데이터 계약으로 사용",
    description:
      "댐별 루트 아래 촬영일, stage, 부재·이미지 유형을 나누어 분석 입력과 산출물을 연결합니다. DB가 업무 상태를 관리하고, 각 모듈은 약속된 디렉터리의 파일을 읽고 쓰는 방식입니다.",
    points: [
      "댐 폴더 식별자와 외부 댐 코드를 매핑합니다. 예를 들어 소양강댐은 01SYD와 1012110으로 연결됩니다.",
      "엑셀의 댐 약자는 중복될 수 있습니다. 소양강댐과 사연댐은 모두 SYD이므로 01SYD·27SYD 같은 전체 폴더 식별자와 댐 코드로 구분해야 합니다.",
      "단계·부재·영상 종류의 규칙이 분석 모듈의 입력·출력 경로와 연결되므로, 모듈 변경 시 파일 규약도 함께 확인해야 합니다.",
    ],
  },
  {
    id: "diagnosis",
    label: "진단·산출물",
    title: "결함 검출부터 설명 가능한 결과와 보고서까지",
    description:
      "입면정사영상 등을 입력으로 결함을 검출하고 측정·후처리와 외관조사망도, 상태평가를 연결합니다. XAI HeatMap과 Captioning은 별도 분기로 실행하여 진단 결과를 검토하는 데 필요한 정보를 제공합니다.",
    points: [
      "검출·측정 API는 실행 요청, 진행 상태, 결과 목록·상세 조회와 다운로드를 연결합니다.",
      "외관조사망도는 CAD(DXF), 상태평가보고서는 한글·PDF 파일로 조회·다운로드하는 흐름을 제공합니다.",
      "작업 완료 후 댐 ID를 외부 댐 코드·이름으로 변환해 K-water 알람 API에 전달합니다.",
      "보고서·도면 생성 예시: 아래 외관조사망도는 여러 도면을 모은 전체 구성과 개별 도면의 상세입니다. 상세 도면에는 결함 위치, 손상물량표, 결함 유형별 범례와 위치도가 함께 표시됩니다.",
    ],
    imageRatio: [1.08, 1.7],
    images: [
      {
        image: "dxf/dxf1.png",
        width: 729,
        height: 871,
        alt: "결함 검출 결과를 반영한 여러 외관조사망도 도면의 전체 배치",
        caption: "보고서·도면 생성 예시 1 — 외관조사망도 전체 구성",
      },
      {
        image: "dxf/dxf2.png",
        width: 1068,
        height: 791,
        alt: "AI 기반 외관조사망도의 결함 위치와 손상물량표, 결함별 범례 및 위치도 상세",
        caption:
          "보고서·도면 생성 예시 2 — 결함 위치와 손상물량을 정리한 개별 도면",
      },
    ],
  },
  {
    id: "learning",
    label: "AI 학습 연계",
    title: "라벨링 데이터에서 운영 Weight 적용까지",
    description:
      "라벨링 프로그램의 프로젝트·Task·Job을 진단 대상의 시설물 속성과 연결합니다. 플랫폼에서 전달한 이미지를 라벨링·검수한 뒤 학습용 데이터로 export하고, Python 파이프라인에서 데이터 분리·전처리·학습·평가를 수행합니다. 백엔드는 실행 설정과 진행 상태, 생성된 Weight 정보를 연결합니다.",
    points: [
      "콘크리트, 필댐 누수, 아스팔트의 진단 유형에 따라 라벨 카테고리를 구분합니다.",
      "학습 시작·완료·오류·진행률 콜백과 Weight 평가정보를 API에서 관리합니다.",
      "운영용 Windows 실행 모듈과 Linux/Python 학습 환경을 연계하는 혼합 실행 구조입니다.",
    ],
    images: [
      {
        image: "kwater_aipipeline.png",
        width: 841,
        height: 870,
        alt: "AI 분석 플랫폼과 딥라벨 사이의 이미지 전송, 라벨링, 학습 및 테스트 데이터 분리, 전처리, 학습, 진단 적용 흐름도",
        caption: "AI 데이터 흐름 — 라벨링·검수에서 학습과 운영 적용까지",
      },
    ],
  },
  {
    id: "learning-export",
    label: "Export 데이터",
    title: "라벨링 프로그램 export 결과를 원본·GT·학습 후보로 구분",
    description:
      "라벨링 프로그램에서 내보낸 결과는 이미지와 annotation JSON이 짝을 이루는 데이터입니다. AI_PIPELINE 아래 콘크리트댐과 필댐 데이터를 나누고, export 결과와 검수용 이미지, 학습·테스트용 데이터를 서로 다른 디렉터리에서 관리합니다.",
    points: [
      "Export_data에는 원본 이미지와 JSON을 저장하고, GT_images에는 GT 이미지, Thumb_images에는 GT 썸네일을 생성합니다. GT와 썸네일은 원본 학습 데이터의 라벨을 확인하는 데 사용합니다.",
      "1차 Data Split은 export 데이터를 학습·검증 후보인 Train_Val_data와 테스트 후보인 Temp_test_data로 분리합니다. 이 단계의 Train_Val은 이후 전처리에서 다시 Train과 Val로 나뉩니다.",
      "전처리 실행 시 학습 후보의 이미지·JSON을 Merge_data로 병합하고 Crop_data에 학습용 결과를 생성합니다. 필댐도 같은 디렉터리 구성 원칙을 따릅니다.",
      "디렉터리 개요도는 신규 Test Data 생성 시 Temp_test_data를 등록 시각별 테스트 데이터로 이동하며, 100개 이상일 때 생성하는 조건을 명시합니다.",
    ],
    images: [
      {
        image: "ai_pipeline_directory.png",
        width: 4356,
        height: 2406,
        alt: "라벨링 프로그램 export의 원본·GT·썸네일 생성과 Train_Val_data·Temp_test_data 분리, 전처리 및 테스트 데이터 등록 디렉터리 구성도",
        caption:
          "Export 이후 데이터 구성 — 원본·미리보기, 학습 후보와 테스트 후보의 분리",
      },
    ],
  },
  {
    id: "learning-preprocessing",
    label: "데이터 전처리",
    title: "두 번의 Split과 Crop·증강으로 학습 데이터 준비",
    description:
      "전처리 API는 type, root_path, validation, augmentation 설정을 Python 모듈에 전달합니다. 원본에서 테스트 데이터를 먼저 분리한 뒤 학습·검증 후보를 병합하고, 이미지와 annotation을 함께 Crop하여 모델이 사용할 데이터셋을 만듭니다.",
    points: [
      "1차 분리: split_algorithm.py가 Test와 Train_Val 이미지 및 각각의 Test.json·Train_Val.json을 생성합니다.",
      "병합: 학습·검증 후보의 이미지와 JSON을 하나의 학습 입력으로 모읍니다. 전처리 구성도에는 병합 스크립트가 marge.py로 표기되어 있습니다.",
      "Crop: coco_pad_crop_v5.py가 학습용 이미지와 JSON을 함께 잘라 Crop_Train_Val 이미지와 Train_Val_crop.json을 생성합니다.",
      "2차 분리: validation 설정을 반영해 Crop 결과를 Train·Val 이미지와 Train_crop.json·Val_crop.json으로 나눕니다.",
      "증강: augmentation.py는 설정에 따라 Train에만 적용합니다. Aug_Train 이미지와 Train_crop_aug.json을 만들며, Val과 Test는 증강 대상에 포함하지 않습니다.",
      "Preprocessing.py는 병합부터 Crop·2차 분리·증강까지 연결합니다. API에서는 export 원본 정보와 전처리 결과 정보를 구분해 조회합니다.",
    ],
    images: [
      {
        image: "ai_pipeline_data_processing.png",
        width: 4188,
        height: 2428,
        alt: "전처리 API 설정에서 1차 Test 분리, 병합, 이미지와 JSON Crop, 2차 Train·Val 분리, Train 증강 및 결과 정보 반환까지의 흐름도",
        caption:
          "전처리 흐름 — 테스트 분리 후 학습 데이터를 가공하고 Train에만 증강 적용",
      },
    ],
  },
  {
    id: "learning-lifecycle",
    label: "데이터 보관",
    title: "학습 범위와 임시·누적 데이터의 수명주기 관리",
    description:
      "상세 디렉터리 설계는 전체 학습(all), 추가 학습(add), 사용자 추가 학습(custom)을 구분합니다. 각 범위의 병합·Crop 산출물과 누적 원본, 등록된 테스트 데이터, 모델별 임시 변환 파일을 나누어 관리하는 구조입니다.",
    points: [
      "All_train_data는 전체 학습용, Train_Val_data는 추가 학습용, Custom_data는 사용자 추가 학습용입니다. 각각 Merge_data와 Crop_data를 두고 images·annotations를 관리합니다.",
      "Crop_data의 images는 Train·Train_aug·Val로 나뉩니다. 전처리 구성도의 Aug_Train은 상세 디렉터리도에서 Train_aug로 표기되어 있어, 두 그림은 증강 데이터의 역할을 중심으로 연결해 볼 수 있습니다.",
      "Acc_data는 최초 입면정사영상인 facade_data, export 후 누적하는 add_data, 사용자가 직접 넣는 custom_data를 구분합니다. Test_data는 facade_data·add_data·add_data_thumb와 등록일별 데이터를 관리합니다.",
      "설계도에서 ‘데이터 삭제’는 일부 데이터를 누적 영역으로 이동하는 처리와 작업 디렉터리를 정리하는 처리를 포함합니다. 전처리 재실행 시 정리하는 중간 산출물과 보관할 원본·테스트 데이터의 범위가 다릅니다.",
      "YOLO·HRNet 학습 과정에서 생성하는 yolo_labels, images_crop, labels, labels_crop, train/val 목록 파일은 학습 완료 후 자동 삭제하는 임시 산출물로 표시되어 있습니다.",
    ],
    images: [
      {
        image: "ai_pipeline_directory_detail.png",
        width: 5014,
        height: 2595,
        alt: "전체·추가·사용자 학습별 Merge_data와 Crop_data, Acc_data 및 Test_data 보관, 모델별 임시 파일 정리 규칙을 표시한 디렉터리 상세도",
        caption:
          "데이터 수명주기 설계 — 학습 범위별 작업 폴더, 누적 보관과 임시 파일 정리",
      },
    ],
  },
  {
    id: "learning-training",
    label: "학습·평가",
    title: "모델별 학습에서 Weight와 결함별 평가 결과까지",
    description:
      "준비된 필댐·콘크리트댐 데이터셋과 학습 설정을 모델별 모듈에 전달합니다. 학습으로 생성한 Weight를 추론 단계에 연결하고, 결함별 annotation·score와 Best Weight 정보, 학습 진행 상태를 API로 반환합니다.",
    points: [
      "학습 입력에는 type·learn_type, epoch·learning_rate·batch_size, augmentation, weight_name과 작업 id를 포함합니다. root_path와 test_data_path·test_data_name으로 사용할 데이터도 지정합니다.",
      "필댐 누수에는 Leakage Detector, 콘크리트댐 결함에는 Mask R-CNN·HRNet·Meta-learning·YOLO 모듈을 연결합니다.",
      "생성된 Weight는 모델별로 관리하고 Inference에 입력합니다. API는 결함별 annotation 정보와 score, Best Weight 파일 경로·생성일을 받아 학습 결과 조회와 모델 선택에 활용합니다.",
      "백엔드는 학습 시작·완료·오류·진행률 콜백을 작업 정보와 연결합니다. 평가 결과를 확인한 뒤 운영 Weight를 선택하면 실제 안전진단에서 해당 모델을 사용합니다.",
    ],
    images: [
      {
        image: "ai_pipeline_model_training.png",
        width: 4146,
        height: 2402,
        alt: "학습 API 파라미터와 필댐·콘크리트댐 모델, 데이터셋, Weight 생성·추론, 결함별 score 및 진행 상태 반환 구성도",
        caption: "모델 학습·평가 — 실행 설정, 모델별 Weight와 API 결과 연결",
      },
    ],
  },
];
</script>

<style scoped>
/* 투명 배경으로 제공된 파이프라인 도표의 글자와 연결선을 선명하게 표시합니다. */
.si-project :deep(img) {
  background-color: white;
}
</style>
