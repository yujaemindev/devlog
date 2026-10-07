export const steps = [
  {
    id: "structure",
    label: "구성과 연동",
    title: "작업 설정과 실행 스크립트를 분리합니다",
    description:
      "자동화 서버인 Jenkins의 설치 설정, 작업 실행 절차, 보고서 생성 도구를 별도 저장소에서 관리합니다. Jenkins는 이 저장소의 main 브랜치에서 실행 절차를 읽고, 서비스 저장소에서 작업 대상 브랜치의 코드를 가져와 빌드·배포 등을 수행합니다.",
    points: [
      "GitHub와 외부 서비스에 접근하는 인증 정보를 Jenkins에서 관리해 소스 코드를 가져오거나 알림을 보내는 데 사용합니다.",
      "BUILD, DEPLOY, VERIFY, REPORT 작업으로 빌드·배포·검증·보고의 역할을 구분했습니다.",
    ],
    imageLayout: "gallery",
    images: [
      {
        image: "cicd_jenkins1.png",
        width: 1916,
        height: 911,
        alt: "BUILD·DEPLOY·REPORT·VERIFY 작업과 실행 이력이 표시된 Jenkins 대시보드",
        caption: "자동화 목적별 Jenkins 작업 목록과 촬영 시점의 실행 이력",
      },
      {
        image: "cicd_github.png",
        width: 1918,
        height: 911,
        alt: "Jenkins 연동용 GitHub 토큰의 저장소 접근 권한 설정",
        caption: "GitHub 저장소 연동을 위한 접근 권한 설정",
      },
      {
        image: "cicd_jenkins4.png",
        width: 1918,
        height: 911,
        alt: "GitHub·Jira·Slack 연결에 필요한 인증 정보를 관리하는 Jenkins 화면",
        caption: "외부 서비스 연결에 필요한 인증 정보 관리",
      },
    ],
  },
  {
    id: "build",
    label: "서비스 빌드",
    title: "브랜치별 빌드 결과를 확인하고 공유합니다",
    description:
      "빌드 작업은 GitHub의 코드 변경 알림을 받아 해당 브랜치의 코드를 가져옵니다. Node.js 실행 환경 확인, 의존성 설치, 서비스 빌드를 순서대로 수행하고 성공·실패 결과를 Slack으로 공유합니다.",
    points: [
      "백엔드는 빌드 전에 개발 환경 설정을 적용합니다. 데이터베이스 생성과 구조 변경 단계는 현재 자동 실행 대상에서 제외되어 있습니다.",
      "Slack 알림에는 브랜치, 변경 이력 식별자(커밋 해시), 작성자와 변경 내용을 포함해 어떤 코드의 빌드 결과인지 확인할 수 있도록 했습니다.",
      "고객사 전용 API 서버는 의존성을 설치한 뒤 임시로 실행해 최대 60초 동안 시작 완료 로그를 확인합니다. 확인 작업이 끝나면 서버를 종료합니다.",
      "고객사 전달용 Docker 배포 패키지는 지정한 브랜치의 패키징 스크립트를 실행해 압축파일로 생성합니다.",
    ],
    imageLayout: "gallery",
    images: [
      {
        image: "cicd_slack3.png",
        width: 988,
        height: 733,
        alt: "백엔드 브랜치·커밋 정보와 빌드 성공을 전달하는 Slack 알림",
        caption: "백엔드 빌드 결과와 변경 커밋 공유",
      },
      {
        image: "cicd_slack2.png",
        width: 987,
        height: 736,
        alt: "프론트엔드 코드 변경과 빌드 성공 Slack 알림",
        caption: "프론트엔드 빌드 결과 공유",
      },
      {
        image: "cicd_slack1.png",
        width: 988,
        height: 700,
        alt: "백그라운드 처리 서비스의 main 및 작업 브랜치 빌드 성공 Slack 알림",
        caption: "백그라운드 처리 서비스의 브랜치별 빌드 결과 공유",
      },
    ],
  },
  {
    id: "deploy",
    label: "서비스 배포",
    title: "대상 브랜치로 이미지를 만들고 컨테이너를 교체합니다",
    description:
      "배포 작업은 지정한 브랜치의 코드로 Docker 이미지를 만들고 실행 중인 컨테이너를 교체합니다. 기본 브랜치는 main입니다. 전체 배포는 백엔드 → 프론트엔드 → 백그라운드 처리 서비스(워커) → 이미지 합성 서비스(파노라마) 순서로 진행하며, 앞선 작업이 끝나면 다음 작업을 실행합니다.",
    points: [
      "백그라운드 처리 서비스는 변경이 드문 실행 환경과 공통 라이브러리를 기본 Docker 이미지로 분리했습니다. 운영체제, Python·Node.js 실행 환경, GPU 연산·영상 처리·AI 실행에 필요한 라이브러리를 미리 설치해 둡니다.",
      "배포 시 기본 이미지가 없으면 먼저 생성하고, 이후에는 이를 재사용해 변경이 잦은 서비스 코드와 의존성을 반영한 워커 이미지를 빌드합니다. 공통 환경을 매번 설치하는 작업을 줄이고, 실행 환경과 서비스 코드의 변경 범위를 나누어 관리합니다.",
      "이미지 합성 서비스(파노라마)는 기본적으로 컨테이너 2개를 실행하고, 각각 서로 다른 서버 포트에 연결합니다.",
      "Jenkins 작업 이력과 실행 로그에서 배포 결과와 단계별 처리 내용을 확인합니다.",
    ],
    imageLayout: "gallery",
    images: [
      {
        image: "cicd_jenkins2.png",
        width: 1916,
        height: 911,
        alt: "백엔드 DEPLOY 작업의 상태와 실행 이력이 표시된 Jenkins 화면",
        caption: "백엔드 배포 작업과 실행 이력",
      },
      {
        image: "cicd_jenkins3.png",
        width: 1918,
        height: 911,
        alt: "백엔드 배포 작업의 파일명 처리 명령이 기록된 Jenkins Console Output",
        caption: "배포 작업의 명령 실행을 추적하는 콘솔 로그",
      },
    ],
    table: {
      caption: "서비스별 컨테이너 배포",
      label: "대상",
      rows: [
        [
          "백엔드",
          "공용 Docker 네트워크 준비 후 개발 서버용 Compose로 재빌드·실행",
        ],
        ["프론트엔드", "Docker Compose로 기존 컨테이너 종료 후 재빌드·실행"],
        [
          "백그라운드 처리 서비스(워커)",
          "CUDA·Python·Node.js 및 공통 AI 라이브러리를 담은 기본 이미지 준비(없을 때 생성) → 기본 이미지를 재사용해 서비스 코드·의존성 빌드 → Compose 실행",
        ],
        [
          "이미지 합성 서비스(파노라마)",
          "이미지 빌드 → 기존 이미지 합성 서비스 컨테이너 제거 → 지정 개수만큼 실행",
        ],
      ],
    },
  },
  {
    id: "verify",
    label: "보안 검증",
    title: "소스와 이미지의 보안 검증 자료를 생성합니다",
    description:
      "통합 보안 검사 작업은 백엔드·프론트엔드·백그라운드 처리·이미지 합성 서비스(파노라마)의 소스 코드와 Docker 이미지에서 소프트웨어 구성요소, 알려진 취약점, 라이선스 정보를 수집합니다. Excel 보고서와 검사 결과를 ZIP으로 묶어 Jenkins에 보관하고 Slack과 이메일로 결과를 공유합니다.",
    points: [
      "대상 브랜치의 코드를 가져와 OpenSSF Scorecard로 저장소의 보안 관리 수준 점검",
      "Docker 이미지 빌드 및 이미지 존재 확인",
      "Syft로 이미지에 포함된 소프트웨어 구성 목록인 SBOM 생성",
      "Grype로 알려진 취약점 검사",
      "Python으로 Excel 보고서 생성 → ZIP 압축 → 산출물 보관 및 알림",
    ],
    images: [
      {
        image: "cicd_slack4.png",
        width: 985,
        height: 737,
        alt: "네 서비스의 소프트웨어 구성 목록 생성과 취약점 검사 작업의 성공·실패를 알리는 Slack 메시지",
        caption:
          "검증 대상, 브랜치, 실행 번호와 Jenkins 링크를 포함한 결과 알림",
      },
      {
        image: "cicd_verify_server.png",
        width: 1065,
        height: 111,
        alt: "백엔드·프론트엔드·이미지 합성·백그라운드 처리 서비스별 취약점을 심각도별로 집계한 보고서",
        caption: "서비스별 취약점 수와 심각도 분포",
      },
      {
        image: "cicd_verify_type.png",
        width: 945,
        height: 133,
        alt: "apk·binary·deb·npm·python 패키지 유형별 취약점 집계",
        caption: "패키지 유형별 취약점 수와 심각도 분포",
      },
      {
        image: "cicd_verify_license.png",
        width: 1886,
        height: 737,
        alt: "프로젝트별 패키지 이름·버전·라이선스와 확인 필요 항목을 정리한 Excel 시트",
        caption: "패키지별 라이선스 정보와 추가 검토 항목",
      },
      {
        image: "cicd_verify_mail.png",
        width: 1914,
        height: 911,
        alt: "브랜치와 Jenkins 빌드 링크, 보안 검사 결과 ZIP을 포함한 검증 완료 이메일",
        caption: "검증 완료 이메일과 결과 ZIP 첨부 예시",
      },
    ],
  },
  {
    id: "report",
    label: "Jira 업무보고",
    title: "Jira 이슈를 Excel 보고서와 첨부파일로 정리합니다",
    description:
      "업무 보고 작업은 업무 관리 도구인 Jira의 여러 프로젝트에서 미리 지정한 담당자의 업무를 조회합니다. 진행 상태와 보고 기간에 맞춰 Excel 보고서를 생성하고 지정된 Slack 채널로 공유합니다.",
    points: [
      "Python 도구로 보고 기간과 주차를 계산하고, Excel 서식을 적용하며 관련 첨부파일을 내려받습니다.",
      "일일 현황, 주간 계획, 주간 진행 현황, 완료 업무의 네 가지 보고서를 주기적으로 생성해 이메일로 전송합니다.",
    ],
    table: {
      caption: "보고 목적별 조회 대상과 결과물",
      label: "보고서 종류",
      rows: [
        ["일일 업무 현황", "현재 완료되지 않은 업무의 일일 보고서"],
        ["주간 업무 계획", "현재 완료되지 않은 업무의 주간 계획 보고서"],
        ["주간 진행 현황", "지정 기간에 변경된 업무 중 시작 전 상태를 제외한 업무 보고서"],
        ["완료 업무 정리", "지정 기간에 완료된 업무 보고서와 관련 첨부파일 ZIP"],
      ],
    },
  },
];
