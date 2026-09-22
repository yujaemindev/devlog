export const steps = [
  {
    id: 'structure', label: '구성과 연동', title: '작업 설정과 실행 스크립트를 분리합니다',
    description: 'jenkins 폴더에서 서버 설치, Jenkins 작업 설정, Groovy 파이프라인과 Python 보고서 도구를 관리합니다. jobs 설정은 CI/CD 저장소의 main 브랜치에서 Groovy 파일을 읽고, 해당 스크립트가 실제 서비스 저장소의 대상 브랜치를 가져와 작업하는 구조입니다.',
    points: ['GitHub 저장소 접근과 Jenkins Credentials 설정을 연결해 코드 체크아웃과 외부 서비스 연동에 사용합니다.', 'BUILD, DEPLOY, VERIFY, REPORT 작업으로 빌드·배포·검증·보고의 역할을 구분했습니다.'],
    imageLayout: 'gallery',
    images: [
      { image: 'cicd_jenkins1.png', width: 1916, height: 911, alt: 'BUILD·DEPLOY·REPORT·VERIFY 작업과 실행 이력이 표시된 Jenkins 대시보드', caption: '자동화 목적별 Jenkins 작업 목록과 촬영 시점의 실행 이력' },
      { image: 'cicd_github.png', width: 1918, height: 911, alt: 'Jenkins 연동용 GitHub 토큰의 저장소 접근 권한 설정', caption: 'GitHub 저장소 연동을 위한 접근 권한 설정' },
      { image: 'cicd_jenkins4.png', width: 1918, height: 911, alt: 'GitHub·Jira·Slack 연동 자격 증명을 관리하는 Jenkins Credentials 목록', caption: 'Jenkins Credentials에서 관리하는 외부 서비스 연동 정보' },
    ],
    table: {
      caption: 'jenkins 폴더 구성', label: '위치',
      rows: [
        ['install_*.sh', 'Ubuntu 서버에 Jenkins, Docker, rclone 설치'],
        ['jobs/*/config.xml', '트리거·저장소·실행할 Groovy 파일을 지정하는 Jenkins 작업 설정 백업'],
        ['scripts/*.groovy', 'Jenkins에서 실행하는 작업 순서 정의'],
        ['scripts/python/*.py', 'Excel 보고서 생성, 날짜·주차 계산, 첨부파일 다운로드'],
      ],
    },
  },
  {
    id: 'build', label: '서비스 빌드', title: '브랜치별 빌드 결과를 확인하고 공유합니다',
    description: 'GS 백엔드·프론트엔드·워커의 BUILD 작업은 GitHub 웹훅에서 브랜치를 받아 체크아웃한 뒤 Node.js 확인, npm install, npm run build를 순서대로 실행합니다. 성공·실패 결과는 Slack으로 전달합니다.',
    points: [
      '백엔드는 빌드 전에 개발 환경 설정을 복사합니다. DB 생성·마이그레이션 단계는 주석 처리되어 있습니다.',
      'Slack 알림에는 브랜치, 커밋 해시, 작성자와 커밋 메시지를 포함해 코드 변경과 빌드 결과를 함께 확인하도록 했습니다.',
      'K-water API 서버는 의존성 설치 후 npm run local을 실행하고 최대 60초 동안 Server started. 로그를 확인합니다. 작업 종료 시 서버 프로세스를 종료하는 기동 확인 방식입니다.',
      'K-water Docker 패키지는 입력한 브랜치의 KWATER_DEPLOY/docker_backup.sh에 Docker 압축파일 생성을 위임합니다.',
    ],
    imageLayout: 'gallery',
    images: [
      { image: 'cicd_slack3.png', width: 988, height: 733, alt: '백엔드 브랜치·커밋 정보와 빌드 성공을 전달하는 Slack 알림', caption: '백엔드 빌드 결과와 변경 커밋 공유' },
      { image: 'cicd_slack2.png', width: 987, height: 736, alt: '프론트엔드 코드 변경과 빌드 성공 Slack 알림', caption: '프론트엔드 빌드 결과 공유' },
      { image: 'cicd_slack1.png', width: 988, height: 700, alt: '워커의 main 및 작업 브랜치 빌드 성공 Slack 알림', caption: '워커의 브랜치별 빌드 결과 공유' },
    ],
    note: 'GS의 BUILD 작업은 코드가 빌드되는지 확인하는 단계입니다. 컨테이너 배포는 DEPLOY 작업에서 별도로 수행합니다.',
  },
  {
    id: 'deploy', label: '서비스 배포', title: '대상 브랜치로 이미지를 만들고 컨테이너를 교체합니다',
    description: 'DEPLOY 작업은 입력한 BRANCH_NAME의 코드를 가져와 Docker 이미지를 만들고 컨테이너를 교체합니다. 기본 브랜치는 main이며, 전체 배포 작업은 백엔드 → 프론트엔드 → 워커 → 파노라마 순서로 개별 작업의 완료를 기다리며 실행합니다.',
    points: ['파노라마는 기본 2개 인스턴스를 실행하며, 호스트 포트는 8001, 8002 순으로 할당합니다.', 'Jenkins 작업 이력과 Console Output으로 배포 실행 내역과 단계별 로그를 확인합니다.'],
    imageLayout: 'gallery',
    images: [
      { image: 'cicd_jenkins2.png', width: 1916, height: 911, alt: '백엔드 DEPLOY 작업의 상태와 실행 이력이 표시된 Jenkins 화면', caption: '백엔드 배포 작업과 실행 이력' },
      { image: 'cicd_jenkins3.png', width: 1918, height: 911, alt: '백엔드 배포 작업의 파일명 처리 명령이 기록된 Jenkins Console Output', caption: '배포 작업의 명령 실행을 추적하는 콘솔 로그' },
    ],
    table: {
      caption: '서비스별 컨테이너 배포', label: '대상',
      rows: [
        ['백엔드', '공용 Docker 네트워크 준비 후 개발 서버용 Compose로 재빌드·실행'],
        ['프론트엔드', 'Docker Compose로 기존 컨테이너 종료 후 재빌드·실행'],
        ['워커', '기본 이미지가 없으면 생성 → 서비스 이미지 빌드 → Compose 실행'],
        ['파노라마', '이미지 빌드 → 기존 파노라마 컨테이너 제거 → 지정 개수만큼 실행'],
      ],
    },
  },
  {
    id: 'verify', label: '보안 검증', title: '소스와 이미지의 보안 검증 자료를 생성합니다',
    description: 'VERIFY_deepinspection_gs_ALL은 백엔드·프론트엔드·워커·파노라마의 소스와 Docker 이미지를 대상으로 구성요소·취약점·라이선스 정보를 수집합니다. 생성한 Excel 보고서와 검사 결과를 ZIP으로 묶어 Jenkins 산출물로 보관하고 Slack·이메일로 알립니다.',
    points: [
      '대상 브랜치 체크아웃 및 OpenSSF Scorecard 검사',
      'Docker 이미지 빌드 및 이미지 존재 확인',
      'Syft로 이미지에 포함된 소프트웨어 구성 목록인 SBOM 생성',
      'Grype로 알려진 취약점 검사',
      'Python으로 Excel 보고서 생성 → ZIP 압축 → 산출물 보관 및 알림',
    ],
    images: [
      { image: 'cicd_slack4.png', width: 985, height: 737, alt: '네 서비스의 Docker SBOM·CVE 검증 실패와 성공을 알리는 Slack 메시지', caption: '검증 대상, 브랜치, 실행 번호와 Jenkins 링크를 포함한 결과 알림' },
      { image: 'cicd_verify_server.png', width: 1065, height: 111, alt: '백엔드·프론트엔드·파노라마·워커별 취약점을 심각도별로 집계한 보고서', caption: '서비스별 취약점 수와 심각도 분포' },
      { image: 'cicd_verify_type.png', width: 945, height: 133, alt: 'apk·binary·deb·npm·python 패키지 유형별 취약점 집계', caption: '패키지 유형별 취약점 수와 심각도 분포' },
      { image: 'cicd_verify_license.png', width: 1886, height: 737, alt: '프로젝트별 패키지 이름·버전·라이선스와 확인 필요 항목을 정리한 Excel 시트', caption: '패키지별 라이선스 정보와 추가 검토 항목' },
      { image: 'cicd_verify_mail.png', width: 1914, height: 911, alt: '브랜치와 Jenkins 빌드 링크, 보안 검사 결과 ZIP을 포함한 검증 완료 이메일', caption: '검증 완료 이메일과 결과 ZIP 첨부 예시' },
    ],
    note: '이 작업은 애플리케이션 기능 테스트보다 보안 검토 자료 수집에 초점을 둡니다. 취약점 심각도에 따른 실패 기준이 지정되어 있지 않아, 작업 성공이 곧 취약점 없음을 의미하지는 않습니다.',
  },
  {
    id: 'report', label: 'Jira 업무보고', title: 'Jira 이슈를 Excel 보고서와 첨부파일로 정리합니다',
    description: 'REPORT 작업은 Jira의 SKD, SDG, CW 프로젝트에서 코드에 지정된 특정 담당자의 이슈를 조회합니다. 보고 목적에 맞게 Excel을 생성하고 Slack #saas 채널에 전달합니다.',
    points: ['scripts/python이 날짜·주차 계산, Excel 서식과 첨부파일 다운로드를 담당합니다.', '일일 보고서의 이메일 전송 코드는 주석 처리되어 있습니다.'],
    table: {
      caption: '보고 목적별 이슈 조회와 산출물', label: 'REPORT 작업',
      rows: [
        ['daily_inprogress', '현재 완료되지 않은 업무의 일일 보고서'],
        ['weekday_plan', '현재 완료되지 않은 업무의 주간 계획 보고서'],
        ['weekday_inprogress', '지정 기간에 수정되었고 To Do가 아닌 업무'],
        ['weekend_complete', '지정 기간에 완료된 업무와 관련 첨부파일 ZIP'],
      ],
    },
    note: '일일·주간은 보고서의 용도를 나타냅니다. 이 스크립트들에는 cron 설정이 없어 정기 실행 여부는 Jenkins 서버 설정에서 별도로 확인해야 합니다.',
  },
];
