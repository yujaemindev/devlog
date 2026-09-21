<template>
  <main
    class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 xl:px-0"
    :style="{ '--section-offset': `${sectionOffset}px` }"
  >
    <WorkflowPageHeader category="EXPERIENCE" label="SILD" title="SILD · AWS 기반 서비스 구축과 운영">
      EC2 기반 애플리케이션 운영부터 상품 추천, 검색, 사용자 행동 분석까지.
      서비스 규모와 운영 비용을 고려해 구축한 SILD의 인프라와 서버 구성을 정리합니다.
    </WorkflowPageHeader>
    <WorkflowStepNav :steps="steps" label="SILD 구축 경험" collapse-after="overview" @offset-change="sectionOffset = $event" />
    <div class="space-y-14">
      <WorkflowSection
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :number="index + 1"
        image-directory="images/experience/sild"
      />
    </div>
  </main>
</template>

<script setup>
import siteMetaInfo from '@/data/sitemetainfo.js'

const sectionOffset = ref(171)
useSeoMeta({
  title: `${siteMetaInfo.title} | Experience · SILD`,
  description: 'SILD의 AWS 인프라, Node.js 서버, Vue 관리자 페이지, 상품 추천 및 Kinesis 기반 사용자 행동 분석 구축 경험',
})

const steps = [
  {
    id: 'overview', label: 'Overview', title: 'AWS 기반 서비스 운영 구조',
    description: 'EC2, RDS, S3, CloudFront, OpenSearch, Kinesis를 중심으로 서비스를 구성했습니다. 운영 전 검증을 위한 STAGE와 실제 서비스를 제공하는 PROD를 분리하고, API·관리자·추천 서버를 역할에 맞게 구성했습니다.',
    points: ['EC2에서 Docker 컨테이너로 애플리케이션을 운영하고, RDS로 데이터를 관리했습니다.', 'S3와 CloudFront로 파일과 웹 콘텐츠를 제공하고, Kinesis와 OpenSearch로 사용자 행동 데이터를 수집·분석했습니다.'],
    images: [{ image: 'overview.webp', width: 750, height: 455, alt: 'STAGE와 PROD의 EC2 컨테이너, RDS, S3, CloudFront 및 외부 API 연동을 보여주는 SILD 구성도', caption: 'Overview — 테스트·운영 환경과 AWS 서비스의 연결 구조' }],
  },
  {
    id: 'ec2', label: 'EC2', title: '테스트 환경 분리와 컨테이너 기반 운영',
    description: 'STAGE는 운영 반영 전 테스트를 위한 서버로, PROD는 실제 서비스 운영 서버로 구축했습니다. 하나의 EC2 인스턴스에 여러 Docker 컨테이너를 배치하고 Nginx로 요청을 분산·전달했습니다.',
    points: ['PROD의 Jenkins 컨테이너는 1개로 운영하고, 나머지 서비스 컨테이너는 상황에 따라 N개로 구성할 수 있도록 했습니다.', 'Nginx에서 로드밸런싱과 리버스 프록시를 구성해 각 컨테이너로 요청을 전달했습니다.', 'STAGE는 사내 IP만 접근하도록 IP 허용 목록을 설정했습니다.'],
  },
  {
    id: 'integration', label: 'Integration Server', title: '계층형 API 서버와 롤링 배포',
    description: 'Node.js에 TypeORM과 routing-controllers를 적용해 Controller–Service–Repository 계층으로 API 서버를 구성했습니다. PM2로 여러 프로세스 인스턴스를 운영하고, 새 버전 배포 시 롤링 방식으로 서비스 중단을 줄이도록 설정했습니다.',
    points: ['Express CORS 설정으로 buy.sild.app 등 허용된 출처의 브라우저 요청에만 교차 출처 접근을 허용했습니다.', 'Blue/Green 배포도 검토했지만 EC2 인스턴스 증설에 따른 비용 제약을 고려해 롤링 배포를 선택했습니다.', 'Mocha와 Chai를 활용해 테스트를 수행하고 코드 커버리지도 점검했습니다.'],
  },
  {
    id: 'admin', label: 'SO', title: '운영 업무를 위한 관리자 페이지',
    description: 'Vue 3와 PrimeVue를 기반으로 관리자 페이지를 구축했습니다. 회원·상품·마켓 관리 기능과 함께 하위 관리자의 업무 범위에 맞는 메뉴 및 기능 권한을 제공했습니다.',
    points: ['관리자별 메뉴 접근과 기능 사용 권한을 부여할 수 있도록 구현했습니다.', '대량 작업은 Excel import로 일괄 처리하고, 수출 신고·정산을 위한 외부 전달 자료는 export할 수 있도록 했습니다.'],
  },
  {
    id: 'recommend', label: 'Recommend', title: '상품 정보 기반 추천과 카테고리 분류',
    description: 'Python 3와 Flask 기반 추천 서버를 구성하고 scikit-learn으로 관련 상품 추천을 구현했습니다. 주기적으로 추가·변경되는 상품 정보를 반영해 추천 모델을 학습시켰습니다.',
    points: ['상품명, 카테고리, 설명, 소재 등 필요한 정보에 가중치를 나누어 적용했습니다.', '패션 의류·잡화의 용어 특성을 반영한 언어사전을 구축하고 주기적으로 튜닝했습니다.', '관련 상품 추천뿐 아니라 카테고리 분류에도 머신러닝을 활용했습니다.'],
  },
  {
    id: 'storage', label: 'RDS · S3 · CDN', title: '관리형 데이터베이스와 콘텐츠 제공',
    description: '소규모 개발팀의 백업·복구 운영 부담을 고려해 MariaDB를 직접 구축하는 대신 RDS를 활용했습니다. 이미지 저장과 웹 콘텐츠 제공에는 S3와 CloudFront를 사용했습니다.',
    points: ['공용 테스트 데이터베이스를 운영 데이터베이스와 분리했습니다.', '카페24·메이크샵 등의 API 연동으로 수집한 이미지 파일을 S3에 저장했습니다.', 'CloudFront를 통해 각종 웹사이트와 콘텐츠를 제공했습니다.'],
  },
  {
    id: 'kinesis', label: 'Kinesis', title: '사용자 행동 데이터 수집',
    description: '사용자의 행동 패턴을 분석하기 위해 Kinesis로 이벤트 데이터를 수집했습니다. 수집한 추적 정보를 검색·분석할 수 있도록 OpenSearch와 연결했습니다.',
    points: ['클라이언트와 서버에서 발생하는 행동 이벤트를 수집하는 흐름을 구성했습니다.', '첨부 구성도는 producer·consumer 역할의 Lambda와 Kinesis를 포함한 이벤트 전달 구조를 보여줍니다.'],
    images: [{ image: 'kinesis.webp', width: 750, height: 397, alt: '클라이언트와 서버, producer 및 consumer Lambda와 Kinesis의 이벤트 전달 구성도', caption: 'Kinesis — 사용자 행동 이벤트 수집 흐름' }],
  },
  {
    id: 'opensearch', label: 'OpenSearch', title: '검색·로깅과 행동 분석 리포트',
    description: '검색과 로깅에는 OpenSearch를 사용했습니다. Kinesis를 통해 수집한 추적 정보를 저장하고, OpenSearch Dashboards에서 이벤트 기록과 시간별 분포를 확인했습니다.',
    points: ['사용자·브랜드·상품과 이벤트 유형 등의 필드로 행동 기록을 살펴볼 수 있도록 했습니다.', '수집한 이벤트를 그래프와 리포트로 정리해 사용자 행동 패턴을 분석했습니다.'],
    images: [{ image: 'kinesis-dashboard.webp', width: 750, height: 376, alt: 'OpenSearch Dashboards의 trace_activity 인덱스에서 시간별 이벤트 그래프와 클릭 로그를 조회한 화면', caption: 'OpenSearch Dashboards — 수집 이벤트의 분포와 상세 기록 조회' }],
  },
  {
    id: 'architecture', label: 'Architecture', title: '서비스 역할과 배포 흐름을 연결하는 아키텍처',
    description: '웹 요청을 처리하는 Integration Server를 중심으로 Partners, Recommend, Batch 서버와 데이터베이스를 연결했습니다. Jenkins를 통한 배포 흐름과 서비스별 역할을 함께 정리한 구조입니다.',
    points: ['Integration Server는 N개로 구성할 수 있는 구조로 설계했습니다.', '사용자 서비스와 관리자·추천·배치 작업의 역할을 나누고 데이터베이스 연동 관계를 정리했습니다.'],
    images: [{ image: 'architecture.webp', width: 750, height: 437, alt: 'CDN과 로드밸런서 아래 여러 Integration Server, Jenkins, Partners, Recommend, Batch 서버 및 데이터베이스 연결도', caption: 'Architecture — 서비스 구성과 Jenkins 배포 및 데이터 연결 관계' }],
  },
]
</script>
