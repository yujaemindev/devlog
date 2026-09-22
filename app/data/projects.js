const projectsData = [
  {
    title: "DeepInspector",
    href: "https://yujaemindev.github.io/devlog/deep_inspector_workflow.png",
    highlight: { text: "시설물 AI 안전진단 SaaS", type: "domain" },
    period: "2024.10 - 현재",
    role: "웹서비스 팀장 / Backend 중심 Full-Stack",
    description:
      "교량·터널·댐·지하철 애자 등 다양한 시설물의 데이터 업로드부터 전처리, AI 진단, 결함 측정, 외관조사망도, 상태평가보고서까지 연결하는 SaaS 플랫폼 개발.",
    tech1: "React · NestJS · TypeORM",
    tech2: "BullMQ · Redis · Python AI",
    tech3: "Docker · Jenkins · Nginx",
  },
  {
    title: "수자원연구원 댐 AI 안전진단",
    highlight: { text: "공공기관 대규모 SI ", type: "domain" },
    href: "https://yujaemindev.github.io/devlog/deep_inspector_kwater_dam_introduce.pdf",
    period: "2024 - 2025",
    role: "Backend / System Integration",
    description:
      "입면정사영상 기반 AI 결함검출 시스템과 외부 Web 가시화·3D 모델링 시스템을 통합. AI 분석/학습 Pipeline, 3D 좌표, 대용량 파일 및 외부 연계 REST API 개발.",
    tech1: "NestJS · TypeORM",
    tech2: "AI Pipeline · REST API",
    tech3: "Docker · Swagger",
  },
  {
    title: "교량 AI 안전진단",
    highlight: { text: "GS 인증 1등급", type: "certification" },
    href: "https://yujaemindev.github.io/devlog/deep_inspector_bridge_introduce.pdf",
    period: "2025 - 2026",
    role: "Platform / Certification",
    description:
      "교량 이미지 업로드와 Panorama, 균열·결함 검출, XAI Heatmap/Captioning, 균열 측정, 외관조사망도 및 상태평가보고서 자동생성까지 End-to-End 기능 통합. GS/TTA 시험 대응.",
    tech1: "React · NestJS",
    tech2: "Worker · AI/XAI",
    tech3: "GS/TTA · Docker",
  },
  {
    title: "터널 AI 안전진단",
    period: "2026",
    role: "Pipeline / Worker / Backend",
    description:
      "영상 Frame 추출, 입·출구 탐색, J-Tag, 수평·수직 Panorama, 균열 검출·연결·측정, LCR/Global 좌표 변환 및 외관조사망도 생성 Pipeline 개발. 대량 AI 작업 안정성 개선.",
    tech1: "NestJS · BullMQ · Redis",
    tech2: "Panorama · AI Pipeline",
    tech3: "Large Image Processing",
  },
  {
    title: "지하철 애자 AI 안전진단 · 대구교통공사",
    highlight: { text: "혁신제품 인증 제품", type: "certification" },
    href: "https://yujaemindev.github.io/devlog/deep_inspector_subway_insulator_introduce.pdf",
    period: "2026",
    role: "System Integration / Delivery",
    description:
      "2CH/4CH 영상 업로드와 전처리, AI 진단, CSV Merge, 외관조사망도 및 상태평가보고서 기능 통합. Windows 납품 서버, Offline 설치·배포, 사용자 교육 및 현장 설치 지원.",
    tech1: "NestJS · Python",
    tech2: "Windows Server · EXE Packaging",
    tech3: "AI Pipeline · Offline Deploy",
  },
  {
    title: "SILD · K-Fashion B2B Platform",
    period: "2021 - 2024",
    role: "창업 / 개발총괄",
    description:
      "K-패션 브랜드의 룩북·상품을 국내외 바이어와 연결하는 B2B 커머스 플랫폼을 창업해 웹·앱·관리자·Backend·인프라를 설계하고 운영. 주문·결제·배송, 검색·추천, 상품연동 등 핵심 도메인 구축.",
    href: "https://yujaemindev.github.io/devlog/sild_introduce.pdf",
    tech1: "Vue.js · Node.js · TypeORM",
    tech2: "AWS · OpenSearch · Kinesis",
    tech3: "Jenkins · Docker · CI/CD",
  },
  {
    title: "SILD · Commerce / 3rd Party Integration",
    href: "https://store.cafe24.com/kr/apps/9343#layerScreenShotMobile",
    period: "2021 - 2024",
    role: "Backend / Integration",
    description:
      "Cafe24/Makeshop 상품·카테고리 동기화, NicePay/해외결제, Naver SMS/Mail, FCM Push, SNS Login, 택배 배송조회 및 브랜드/상품/룩북 통합검색 기능 개발.",
    tech1: "Cafe24 · Makeshop",
    tech2: "NicePay · FCM · OAuth",
    tech3: "OpenSearch · AWS S3",
  },
  {
    title: "SILD · Android/iOS Hybrid App",
    period: "2021 - 2024",
    role: "Web / Native Hybrid",
    description:
      "Vue.js 사용자 서비스를 Android WebView·iOS WKWebView 앱으로 제공하고 Native-Web Bridge, Push Token, Deep Link, Cookie/Session, 이미지 선택 및 외부 브라우저 연동 구현.",
    tech1: "Vue.js · Android Java",
    tech2: "iOS Swift · WebView",
    tech3: "FCM · Deep Link",
  },
  {
    title: "보험피팅 · 마이데이터 보험 분석",
    details: {
      heading: "보험 분석·설계사 CRM 서비스 개발",
      paragraphs: [
        "보험 데이터를 분석하고 보험설계사의 고객관리를 지원하는 서비스를 개발했습니다. 보험 데이터 분석, 설계사 CRM, 고객 매칭을 연결해 고객앱과 설계사앱에서 활용할 수 있도록 구현했습니다.",
      ],
      sections: [
        {
          heading: "신용정보원 데이터 수집과 보험 분석",
          paragraphs: [
            "신용정보원 데이터를 수집해 고객의 보험을 분석하고, 암·뇌혈관·심혈관·실손·수술·입원·후유장해·치매·사망·운전자보험 등 다양한 보장 항목을 체계화했습니다. 보장 영역별 분석 결과와 개별 보험의 상세 정보를 확인할 수 있도록 구성했습니다.",
          ],
          images: [
            { src: "images/projects/bofit/bofit1.png", alt: "신용정보원 보험 분류를 기반으로 정리한 고객 보험 보장 항목", caption: "고객 보험 분석을 위한 보장 항목 분류 체계" },
            { src: "images/projects/bofit/bofit2.png", alt: "보장 영역별 부족 여부와 가입 금액을 보여주는 고객 보장 분석 화면", caption: "보장 영역별 분석 결과와 세부 보장 내역", portrait: true },
            { src: "images/projects/bofit/bofit3.png", alt: "고객 보장금액과 권장 보장금액, 보유 보험을 비교하는 상세 화면", caption: "보유 보험 상세와 보장금액 비교", portrait: true },
          ],
        },
        {
          heading: "설계사 CRM과 고객 매칭",
          paragraphs: [
            "보험설계사가 고객을 등록하고 상담 관계를 관리할 수 있도록 고객 CRM, 고객 상태 관리, 고객 매칭 기능을 개발했습니다. 카카오톡 초대 Deep Link를 통해 고객과 설계사를 연결하고, 초대·수락·상담·해제 등 상태에 따른 고객 관리 흐름을 구현했습니다.",
          ],
          points: [
            "고객 CRM과 상담 상태 관리",
            "카카오톡 초대 Deep Link를 통한 고객 연결",
            "고객과 설계사 매칭 및 상태별 관리 흐름",
          ],
          images: [
            { src: "images/projects/bofit/bofit4.png", alt: "설계사의 고객 등록·초대·매칭 경로와 상담 상태별 관리 흐름도", caption: "고객 유입 경로와 상담 상태에 따른 CRM 처리 흐름" },
          ],
        },
        {
          heading: "로그인·알림과 서비스 연동",
          paragraphs: [
            "카카오·네이버·애플 소셜 로그인, FCM Push, 정기 문자 메시지 기능을 개발했습니다. Spring Boot 백엔드와 React Native 앱 개발에 참여하며 보험 분석과 고객관리 기능을 서비스로 연결했습니다.",
          ],
          points: [
            "카카오·네이버·애플 소셜 로그인",
            "FCM Push와 정기 문자 메시지",
          ],
          images: [
            { src: "images/projects/bofit/bofit5.png", alt: "고객앱·설계사앱과 API Gateway, 인증·Push·CRM 모듈 및 데이터 저장소를 연결한 보험피팅 서비스 구성도", caption: "고객앱·설계사앱과 주요 서비스 모듈의 전체 구성" },
          ],
        },
      ],
    },
    period: "2020 - 2021",
    role: "Backend / Mobile App",
    description:
      "마이데이터 기반 보험 리모델링 고객앱·설계사앱 개발. 초기 아이디어와 서비스 설계부터 Spring Boot Backend, React Native 앱, Jenkins 배포 및 제품 출시까지 참여.",
    href: "https://www.industrynews.co.kr/news/articleView.html?idxno=40670",
    tech1: "Spring Boot",
    tech2: "React Native",
    tech3: "MariaDB · Jenkins",
  },
  {
    title: "Knox Portal 관리자",
    details: {
      heading: "대규모 사내 메일 관리시스템 개발·운영",
      paragraphs: [
        "대기업 사내 메일 엔진을 관리하는 시스템의 UI 개발과 유지보수를 맡았습니다. 이후 서버 개발까지 담당하며 프론트엔드부터 백엔드, DB, 서버 간 통신 구조까지 경험을 확장했습니다.",
      ],
      sections: [
        {
          heading: "관리 화면 개발과 공통 컴포넌트 개선",
          paragraphs: [
            "AngularJS 기반으로 REST API 통신을 구현하고, 계정·그룹메일·임직원 환경설정·조직 정책·시스템 모니터링·로그 조회·권한관리 화면을 개발했습니다. 복잡한 List/Tree 구조는 공통 컴포넌트로 리팩토링하고, 기능별 권한 제어를 구현했습니다.",
          ],
          images: [
            { src: "images/projects/knox/knox1.png", alt: "Knox Portal 회사 설정 화면과 중첩 컨트롤러 구성", caption: "메뉴·정책·회사 설정과 목록·상세 화면을 연결하는 컨트롤러 구조" },
          ],
        },
        {
          heading: "AngularJS 대규모 화면 성능 최적화",
          paragraphs: [
            "AngularJS의 $digest 구조와 데이터 바인딩 흐름을 이해하고, 대규모 관리 화면에서 변경 감지와 반복 계산에 드는 비용을 줄였습니다.",
          ],
          points: [
            "ng-show/ng-hide 대신 ng-if를 활용해 불필요한 화면 요소와 변경 감지 부담을 줄였습니다.",
            "$watch 수를 최소화했습니다.",
            "Deep Watching을 제거해 깊은 객체 비교 비용을 줄였습니다.",
            "반복 계산 로직을 리팩토링했습니다.",
          ],
          images: [
            { src: "images/projects/knox/knox2.png", alt: "AngularJS의 모델 변경, digest loop와 View 렌더링 흐름", caption: "모델 변경과 digest loop, 화면 렌더링의 관계" },
            { src: "images/projects/knox/knox3.png", alt: "ngModel Controller의 데이터 바인딩과 Formatters·Parsers 흐름", caption: "ngModel Controller를 통한 모델·화면 간 데이터 변환과 바인딩" },
          ],
        },
        {
          heading: "백엔드 개발과 분산 시스템 연동",
          paragraphs: [
            "Spring 기반 REST API와 VO/DAO/Service 계층을 구현했습니다. DB DDL/DML 작성과 쿼리 튜닝, 권한 처리, Agent를 이용한 다른 서버와의 통신도 담당했습니다.",
            "Apache Reverse Proxy, 여러 WAS, Spring/MyBatis, Master/Slave DB, Mail Engine Agent와 Scheduler가 연동되는 환경에서 개발했습니다. Quartz Scheduler를 이용한 작업 처리까지 포함해 여러 서버와 컴포넌트가 함께 동작하는 구조를 경험했습니다.",
          ],
          images: [
            { src: "images/projects/knox/knox4.png", alt: "Apache 프록시, WildFly·Spring·MyBatis, Master·Slave DB 및 메일 엔진 Agent·Quartz Scheduler 구성도", caption: "관리시스템과 메일 엔진, DB 및 외부 시스템의 연동 구조" },
          ],
        },
      ],
    },
    highlight: { text: "삼성 그룹웨어", type: "domain" },
    period: "2015 - 2020",
    role: "Enterprise Web Developer",
    description:
      "삼성 그룹웨어 관리자 시스템 개발·운영. Spring 3→4, Java 1.6→1.8 마이그레이션, 관리자 권한/정책 DB 설계, 중복 코드 모듈화 및 AngularJS 화면 성능 개선.",
    tech1: "Java · Spring",
    tech2: "AngularJS",
    tech3: "Tomcat · WildFly",
  },
  {
    title: "제품 평판 분석 시스템",
    details: {
      heading: "웹 크롤링 및 업무 자동화",
      paragraphs: [
        "초기에는 제품 평판 분석을 위한 데이터 수집 시스템을 개발했습니다. Python Scrapy를 기반으로 네이버·다음 블로그, 쇼핑몰 리뷰, 온라인 커뮤니티, 뉴스, 카페 등 여러 사이트에서 게시글·댓글·추천수 등의 데이터를 주기적으로 수집했고, XPath를 활용해 사이트별 HTML 구조를 분석했습니다. 로그인 토큰 만료 처리, Selenium 및 PhantomJS를 활용한 인증 우회와 브라우저 자동화 등 실제 크롤링 운영에서 발생하는 문제도 다뤘습니다.",
        "여기서 더 나아가 크롤러와 Telegram CLI를 연동해 날씨 정보를 휴대폰으로 전달하거나, 사내 Confluence를 크롤링해 여러 테스트 환경의 관리 페이지 북마크를 자동으로 만드는 등 반복 업무를 자동화하는 도구도 만들었습니다.",
      ],
    },
    period: "S-Core",
    role: "Data Collection / Backend",
    description:
      "국내외 전자제품 후기·기사·댓글을 수집하는 크롤러 통합과 Rule-based 수집 시스템 개발. MySQL DB 설계, Linux Cron 및 Elasticsearch 기반 데이터 처리 경험.",
    tech1: "Python · Scrapy · Selenium",
    tech2: "MySQL",
    tech3: "Elasticsearch · Linux Cron",
  },
];

export default projectsData;
