const projectsData = [
  {
    title: "DeepInspector",
    details: {
      heading: "개요",
      gallery: {
        imageDirectory: "images/projects/deepinspector/title",
        label: "DeepInspector 주요 기능 화면",
        images: [
          {
            image: "1.jtag.png",
            width: 1912,
            height: 906,
            alt: "J-Tag 화면",
            caption: "J-Tag",
          },
          {
            image: "2.horizontalpanorama.png",
            width: 1913,
            height: 908,
            alt: "수평 파노라마 화면",
            caption: "수평 파노라마",
          },
          {
            image: "3.crackdetect.png",
            width: 1916,
            height: 908,
            alt: "균열 검출 화면",
            caption: "균열 검출",
          },
          {
            image: "4.crazing.png",
            width: 1914,
            height: 908,
            alt: "망상균열 화면",
            caption: "망상균열",
          },
          {
            image: "5.crackline.png",
            width: 1915,
            height: 909,
            alt: "균열 연결 화면",
            caption: "균열 연결",
          },
          {
            image: "6-1.leancutresize_before.png",
            width: 1913,
            height: 907,
            alt: "Lean·Cut·Resize 적용 전 화면",
            caption: "Lean·Cut·Resize 적용 전",
          },
          {
            image: "6-2.leancutresize_after.png",
            width: 1911,
            height: 907,
            alt: "Lean·Cut·Resize 적용 후 화면",
            caption: "Lean·Cut·Resize 적용 후",
          },
          {
            image: "7.verticalpanorama.png",
            width: 1913,
            height: 907,
            alt: "수직 파노라마 화면",
            caption: "수직 파노라마",
          },
          {
            image: "8.crazingedit.png",
            width: 1913,
            height: 907,
            alt: "망상균열 편집 화면",
            caption: "망상균열 편집",
          },
          {
            image: "9.crackedit.png",
            width: 1916,
            height: 907,
            alt: "균열 편집 화면",
            caption: "균열 편집",
          },
          {
            image: "10-1.webdxf.png",
            width: 1914,
            height: 908,
            alt: "웹 DXF 화면",
            caption: "웹 DXF",
          },
          {
            image: "10-2.realdxf.png",
            width: 1337,
            height: 878,
            alt: "DXF 도면 화면",
            caption: "DXF 도면",
          },
          {
            image: "11-1.statereport.png",
            width: 1911,
            height: 899,
            alt: "상태평가보고서 화면",
            caption: "상태평가보고서",
          },
          {
            image: "11-2.statereportresult.png",
            width: 906,
            height: 1574,
            alt: "상태평가보고서 결과",
            caption: "상태평가보고서 결과",
          },
          {
            image: "12.xai.png",
            width: 1325,
            height: 896,
            alt: "XAI 화면",
            caption: "XAI",
          },
        ],
      },
      paragraphs: [
        "교량·터널 등 시설물의 촬영 데이터를 AI로 분석하고, 결함 검수부터 외관조사망도와 상태평가보고서 생성까지 연결하는 웹서비스입니다. 현장의 안전진단 기준과 실제 작업 절차를 분석해 자동화할 수 있는 범위를 정의하고, 전문가의 검토가 필요한 작업을 함께 지원하도록 설계했습니다.",
      ],
      sections: [
        {
          heading: "끊임 없는 안전 사고",
          paragraphs: [
            "교량·터널·지하차도 등 공공시설물에서는 공사 중 붕괴와 운영 중 침수 사고가 반복되고 있습니다. 사고의 원인은 서로 다르지만, 공공 시설물들을 객관적인 기준으로 주기적인 안전 점검이 필요합니다.",
          ],
          incidents: [
            {
              date: "2026.05",
              name: "서울 서소문 고가차도 붕괴",
              source: "서울특별시",
              href: "https://www.seoul.go.kr/news/news_report.do?nttNo=458625",
            },
            {
              date: "2025.12",
              name: "광주 대표도서관 건립공사 붕괴",
              source: "고용노동부",
              href: "https://moel.go.kr/news/enews/report/enewsView.do?news_seq=19519",
            },
            {
              date: "2025.07",
              name: "경기 오산 보강토옹벽 붕괴",
              source: "국토교통부",
              href: "https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95091739",
            },
            {
              date: "2025.04",
              name: "광명 신안산선 터널 붕괴",
              findings:
                "구조계산 오류와 미확인 단층대, 중앙기둥 균열 관리 및 안전점검 미흡 등이 복합적으로 확인됐습니다.",
              implication:
                "균열의 발생과 진행 상태를 지속적으로 확인하고, 지반·구조 계측과 전문가 검토로 연결하는 관리가 필요합니다.",
              source: "국토교통부",
              href: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156752603",
            },
            {
              date: "2025.03",
              name: "서울 명일동 대형 땅꺼짐",
              source: "국토교통부",
              href: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156732996",
            },
            {
              date: "2025.02",
              name: "세종~안성 고속도로 청용천교 붕괴",
              findings:
                "거더 전도방지 장치 제거와 이동 공정의 안전성 검토 문제가 조사에서 지적됐습니다.",
              implication:
                "외관 결함 점검과 함께 작업순서, 임시받침과 가시설의 상태를 확인하는 별도의 시공 안전관리가 필요합니다.",
              source: "국토교통부",
              href: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156721746",
            },
            {
              date: "2024.04",
              name: "시흥 시화MTV 교량 거더 붕괴",
              source: "연합뉴스",
              href: "https://www.yna.co.kr/view/AKR20240503102400061",
            },
            {
              date: "2023.07",
              name: "오송 궁평2지하차도 침수",
              findings:
                "홍수경보와 통제 기준 충족에도 적기에 교통 통제와 상황 전파가 이뤄지지 않은 문제가 정부 감찰에서 확인됐습니다.",
              implication:
                "위험을 감지한 뒤 담당자의 판단과 현장 통제까지 이어지는 대응체계가 중요합니다.",
              source: "국무조정실",
              href: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156582908",
            },
            {
              date: "2023.04",
              name: "성남 정자교 보행로 붕괴",
              source: "국토교통부",
              href: "https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95088562",
            },
            {
              date: "2020.07",
              name: "부산 초량 제1지하차도 침수",
              source: "연합뉴스",
              href: "https://www.yna.co.kr/view/AKR20200724030700051",
            },
            {
              date: "2019.07",
              name: "서울 목동 빗물저류배수시설 수몰",
              source: "연합뉴스",
              href: "https://www.yna.co.kr/view/AKR20190731052454004",
            },
            {
              date: "2017.08",
              name: "평택 국제대교 붕괴",
              source: "연합뉴스",
              href: "https://www.yna.co.kr/view/AKR20170828044600033",
            },
          ],
        },
        {
          heading: "추진 배경",
          paragraphs: [
            "기존 시설물 점검은 육안 조사와 수기 기록에 의존해 많은 인력과 시간이 필요했습니다. 점검자의 경험과 판단 기준에 따라 결과에 편차가 생기고, 조사 이후에도 결함 측정값 정리와 도면·보고서 작성에 상당한 시간이 들었습니다. 접근이 어려운 시설물에서는 작업자의 안전 부담도 있었습니다.",
            "DeepInspector는 AI를 활용한 촬영 데이터의 분석과 후속 문서 작업을 연결해 반복 업무를 줄이고, 일관된 기준으로 점검 결과를 검토할 수 있는 환경을 만드는 것을 목표로 했습니다.",
          ],
        },
        {
          heading: "준비 과정 1 · 시설물별 진단 기준과 자동화 범위 정리",
          gallery: {
            imageDirectory: "images/projects/deepinspector/ready",
            label: "시설물별 진단 기준과 자동화 범위 준비 자료",
            images: [
              { image: "ready1.png", width: 913, height: 803, alt: "시설물 진단 준비 자료 1", caption: "준비 자료 1" },
              { image: "ready2.png", width: 1678, height: 696, alt: "시설물 진단 준비 자료 2", caption: "준비 자료 2" },
              { image: "ready3-1.png", width: 1745, height: 804, alt: "시설물 진단 준비 자료 3-1", caption: "준비 자료 3-1" },
              { image: "ready3-2.png", width: 1743, height: 778, alt: "시설물 진단 준비 자료 3-2", caption: "준비 자료 3-2" },
              { image: "ready3-3.png", width: 1739, height: 766, alt: "시설물 진단 준비 자료 3-3", caption: "준비 자료 3-3" },
              { image: "ready3-4.png", width: 1748, height: 804, alt: "시설물 진단 준비 자료 3-4", caption: "준비 자료 3-4" },
              { image: "ready3-5.png", width: 1741, height: 805, alt: "시설물 진단 준비 자료 3-5", caption: "준비 자료 3-5" },
              { image: "ready4-1.png", width: 1301, height: 756, alt: "시설물 진단 준비 자료 4-1", caption: "준비 자료 4-1" },
              { image: "ready4-2.png", width: 1387, height: 772, alt: "시설물 진단 준비 자료 4-2", caption: "준비 자료 4-2" },
            ],
          },
          paragraphs: [
            "안전점검 세부지침과 기존 진단보고서를 비교해 부재·재료별 결함 종류와 상태평가 기준을 마스터테이블로 정리했습니다. 각 결함에 대해 데이터 보유 여부, 영상에서의 식별 가능 여부, 라벨링 현황과 GS 인증 대상 범위를 확인했습니다.",
            "박리·박락·파손처럼 구분이 어려운 결함은 라벨링 기준을 구체화하고, 부재별 파노라마 품질과 실제 크기 환산에 필요한 입력값을 정리했습니다. 데이터셋과 파노라마에서의 모델 성능도 비교해 실제 서비스 적용을 위한 검토 자료를 마련했습니다.",
            "영상으로 판단하기 어렵거나 별도 시험·전문가 판단이 필요한 항목은 사용자 입력으로 보완하도록 범위를 정의했습니다.",
          ],
        },
        {
          heading: "준비 과정 2 · 터널 현장 데이터와 처리 흐름 구체화",
          paragraphs: [
            "터널별 촬영 자료와 기존 외관조사망도·진단보고서를 조사하고, 터널 형상과 경간·조인트 구성에 따라 필요한 데이터와 예외 상황을 정리했습니다.",
            "카메라 시작점 불일치, 촬영 속도 변화, 조인트 가림, 파노라마 연결 오류 등 현장에서 발생하는 문제를 개발·AI 과제로 구체화했습니다. 영상 프레임 추출부터 입·출구 탐색, J-Tag 검출, 파노라마 생성, 균열 검출·연결·측정, 좌표 보정과 도면화까지 단계별 처리 흐름과 인터페이스를 정리했습니다.",
            "결과를 수정하고 다시 분석하는 상황도 고려해 단계별 초기화 범위와 파일·DB 처리 규칙을 정의했습니다.",
          ],
        },
        {
          heading: "해결 방향 · 분석부터 검수와 보고서까지 연결",
          paragraphs: [
            "드론·카메라로 촬영한 이미지와 영상을 업로드하면 전처리와 파노라마 생성을 거쳐 시설물별 결함을 AI로 탐지합니다. 검출한 결함의 위치와 크기를 측정·시각화하고, 사용자가 결과를 검수하거나 수정할 수 있도록 연결합니다.",
            "검수한 결과는 외관조사망도와 상태평가보고서 생성에 활용하고, XAI 시각화를 통해 AI의 판단 근거를 확인할 수 있도록 구성합니다. 이를 통해 데이터 분석부터 최종 산출물 작성까지 이어지는 안전진단 업무를 하나의 웹서비스에서 지원합니다.",
          ],
        },
      ],
    },
    href: "https://yujaemindev.github.io/devlog/deep_inspector_workflow.png",
    highlight: { text: "시설물 AI 안전진단 SaaS", type: "domain" },
    period: "2024.10 - 현재",
    role: "웹서비스 팀장 / 기획, Full-Stack 개발 및 운영",
    description:
      "교량·터널·댐·지하철 애자 등 다양한 시설물의 데이터 업로드부터 전처리, AI 진단, 결함 측정, 외관조사망도, 상태평가보고서까지 연결하는 SaaS 플랫폼 개발.",
    tech1: "React · NestJS · TypeORM",
    tech2: "BullMQ · Redis · Python AI",
    tech3: "Docker · Jenkins · Nginx",
  },
  {
    title: "수자원연구원 댐 AI 안전진단",
    to: "/experience/si-project",
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
            {
              src: "images/projects/bofit/bofit1.png",
              alt: "신용정보원 보험 분류를 기반으로 정리한 고객 보험 보장 항목",
              caption: "고객 보험 분석을 위한 보장 항목 분류 체계",
            },
            {
              src: "images/projects/bofit/bofit2.png",
              alt: "보장 영역별 부족 여부와 가입 금액을 보여주는 고객 보장 분석 화면",
              caption: "보장 영역별 분석 결과와 세부 보장 내역",
              portrait: true,
            },
            {
              src: "images/projects/bofit/bofit3.png",
              alt: "고객 보장금액과 권장 보장금액, 보유 보험을 비교하는 상세 화면",
              caption: "보유 보험 상세와 보장금액 비교",
              portrait: true,
            },
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
            {
              src: "images/projects/bofit/bofit4.png",
              alt: "설계사의 고객 등록·초대·매칭 경로와 상담 상태별 관리 흐름도",
              caption: "고객 유입 경로와 상담 상태에 따른 CRM 처리 흐름",
            },
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
            {
              src: "images/projects/bofit/bofit5.png",
              alt: "고객앱·설계사앱과 API Gateway, 인증·Push·CRM 모듈 및 데이터 저장소를 연결한 보험피팅 서비스 구성도",
              caption: "고객앱·설계사앱과 주요 서비스 모듈의 전체 구성",
            },
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
            {
              src: "images/projects/knox/knox1.png",
              alt: "Knox Portal 회사 설정 화면과 중첩 컨트롤러 구성",
              caption:
                "메뉴·정책·회사 설정과 목록·상세 화면을 연결하는 컨트롤러 구조",
            },
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
            {
              src: "images/projects/knox/knox2.png",
              alt: "AngularJS의 모델 변경, digest loop와 View 렌더링 흐름",
              caption: "모델 변경과 digest loop, 화면 렌더링의 관계",
            },
            {
              src: "images/projects/knox/knox3.png",
              alt: "ngModel Controller의 데이터 바인딩과 Formatters·Parsers 흐름",
              caption:
                "ngModel Controller를 통한 모델·화면 간 데이터 변환과 바인딩",
            },
          ],
        },
        {
          heading: "백엔드 개발과 분산 시스템 연동",
          paragraphs: [
            "Spring 기반 REST API와 VO/DAO/Service 계층을 구현했습니다. DB DDL/DML 작성과 쿼리 튜닝, 권한 처리, Agent를 이용한 다른 서버와의 통신도 담당했습니다.",
            "Apache Reverse Proxy, 여러 WAS, Spring/MyBatis, Master/Slave DB, Mail Engine Agent와 Scheduler가 연동되는 환경에서 개발했습니다. Quartz Scheduler를 이용한 작업 처리까지 포함해 여러 서버와 컴포넌트가 함께 동작하는 구조를 경험했습니다.",
          ],
          images: [
            {
              src: "images/projects/knox/knox4.png",
              alt: "Apache 프록시, WildFly·Spring·MyBatis, Master·Slave DB 및 메일 엔진 Agent·Quartz Scheduler 구성도",
              caption: "관리시스템과 메일 엔진, DB 및 외부 시스템의 연동 구조",
            },
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
