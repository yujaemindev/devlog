const projectsData = [
  {
    title: "DeepInspector",
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
    highlight: { text: "GS 인증 제품", type: "certification" },
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
