export const steps = [
  {
    id: "prepare",
    label: "갱신 준비",
    title: "도메인과 기존 인증서 설정을 확인합니다",
    description:
      "HTTPS 인증서는 접속한 서버의 신원을 확인하고 암호화 통신을 구성하는 데 사용됩니다. 만료 전에 인증서를 갱신하고 웹서버가 새 파일을 읽도록 반영해야 합니다. 이 사례에서는 Windows용 win-acme와 Let's Encrypt 인증기관을 사용했습니다.",
    points: [
      "대상 도메인, DNS 관리 권한, Nginx 실행 경로와 인증서 저장 위치를 확인합니다. 기존 설정과 인증서 파일은 복구할 수 있도록 보관합니다.",
      "관리자 권한으로 win-acme를 실행합니다. 기존 갱신 항목은 A: Manage renewals에서 확인하고, 갱신 기한이 된 항목은 R: Run renewals로 실행합니다.",
      "아래의 M: Create certificate (full options) 흐름은 최초 구성 또는 저장 방식 등 설정을 다시 지정할 때 사용한 절차입니다. 기존 항목을 덮어쓸 때는 대상 도메인과 설정을 확인합니다.",
      "처음 등록할 때는 이용약관을 확인하고 운영 담당 이메일을 입력합니다. 예시의 example.com과 파일 경로는 실제 환경에 맞게 바꿉니다.",
    ],
  },
  {
    id: "configure",
    label: "발급 설정",
    title: "도메인 인증 방식과 웹서버용 파일 형식을 선택합니다",
    description:
      "도메인을 직접 입력하고 DNS에 인증용 텍스트 값을 등록하는 DNS-01 방식을 선택했습니다. 인증서는 Nginx가 읽을 수 있는 PEM 형식으로 저장하고, 웹서버 적용은 별도 단계에서 진행합니다.",
    points: [
      "M: 전체 옵션 → Manual input: 도메인 직접 입력 → example.com → Single certificate: 하나의 인증서로 구성합니다.",
      "Create verification records manually: DNS 인증 값을 직접 등록하는 옵션을 선택하고, 이 사례에서는 개인키 형식으로 RSA를 사용했습니다.",
      "PEM encoded files를 선택하고 D:\\nginx\\ssl\\example.com을 저장 위치로 지정합니다. 추가 저장은 No (additional) store steps를 선택합니다.",
      "개인키 비밀번호는 이 사례에서 None을 선택했습니다. 암호 없는 개인키 파일은 Nginx 실행 계정과 관리자 등 필요한 계정만 접근하도록 파일 권한을 제한합니다.",
      "No (additional) installation steps를 선택했으므로 파일 저장 후 Nginx에 자동 반영되지는 않습니다.",
    ],
  },
  {
    id: "dns",
    label: "DNS 등록",
    title: "이번 인증 요청에 표시된 TXT 값을 등록합니다",
    description:
      "DNS는 도메인의 연결 정보를 관리하는 시스템입니다. 여기에 인증기관이 요구한 TXT 레코드를 등록하면 도메인을 관리할 권한이 있음을 증명할 수 있습니다. 사용한 DNS 관리 사이트에서는 네임서버 고급설정의 TXT 관리 화면에서 값을 변경했습니다.",
    points: [
      "win-acme가 표시하는 Record, Type, Content를 확인합니다. 레코드 이름은 _acme-challenge.example.com이고 유형은 TXT입니다. _acme_challenge처럼 하이픈을 밑줄로 바꾸지 않습니다.",
      "호스트명 뒤에 도메인이 자동으로 붙는 관리 화면에서는 _acme-challenge만 입력합니다. 저장된 전체 이름이 프로그램에 표시된 이름과 일치하는지 확인합니다.",
      "Content에는 이번 실행에 표시된 값을 그대로 입력합니다. 이전 기록의 인증 값을 재사용하지 않고, 따옴표 처리 방식은 DNS 관리 화면의 안내를 확인합니다.",
      "기존 인증용 값을 바꿀 때는 다른 인증 작업에서 사용 중인지 확인합니다. 메일용 SPF 등 관계없는 TXT 레코드는 유지합니다.",
    ],
    imageLayout: "gallery",
    images: [
      {
        image: "nameserver1.png",
        width: 1039,
        height: 538,
        alt: "DNS 관리 사이트에서 대상 도메인을 선택하고 네임서버 고급설정으로 진입하는 화면",
        caption: "대상 도메인 선택과 네임서버 고급설정 진입",
      },
      {
        image: "nameserver2.png",
        width: 798,
        height: 575,
        alt: "TXT 레코드 관리 영역에서 _acme-challenge 호스트와 인증 값을 입력하는 화면",
        caption: "인증용 TXT 레코드 등록 — 화면의 SPF(TXT) 관리 영역 이용",
      },
    ],
  },
  {
    id: "validate",
    label: "반영 확인",
    title: "DNS 서버별 응답을 확인한 뒤 인증을 재시도합니다",
    description:
      "실행 중 ‘Preliminary validation failed on 3/4 nameservers’가 발생했습니다. 네 곳 중 세 곳에서 사전 검증이 실패했다는 뜻이며, 반영 지연이나 레코드 설정 문제를 구분해 확인해야 합니다. Google DNS에서 값이 조회된 것만으로 모든 DNS 서버에 반영됐다고 판단하지 않습니다.",
    points: [
      "먼저 공용 DNS에서 TXT 값을 조회하고, 도메인의 원본 DNS 정보를 관리하는 권한 네임서버(NS) 목록을 확인합니다.",
      "조회된 각 네임서버에 직접 TXT 질의를 보내 현재 인증 값이 포함되어 있는지 비교합니다. 아래 ns1.example.net은 실제 조회된 서버 이름으로 바꾸고 다른 서버에도 반복합니다.",
      "값이 없거나 다르면 호스트명과 입력 값을 점검하고 DNS 제공 업체의 반영 상태를 확인합니다. 반영 시간은 환경마다 달라 일정 시간 안에 완료된다고 단정할 수 없습니다.",
      "값이 확인되면 win-acme에서 Enter 또는 1: Retry check를 선택합니다. 사전 검증 성공과 Authorization result: valid를 확인한 뒤 다음 단계로 진행합니다.",
    ],
    commands: [
      {
        title: "PowerShell · 공용 DNS와 권한 네임서버 조회",
        code: "nslookup -type=TXT _acme-challenge.example.com 8.8.8.8\nnslookup -type=NS example.com 8.8.8.8\nnslookup -type=TXT _acme-challenge.example.com ns1.example.net",
      },
    ],
  },
  {
    id: "export",
    label: "인증서 저장",
    title: "PEM 저장 결과와 캐시 재사용 여부를 구분합니다",
    description:
      "실행 기록에서 Store with PemFiles와 Exporting .pem files를 통해 파일 저장을 확인했습니다. 같은 조건으로 다시 실행했을 때는 Using cache 로그가 나타나 기존에 발급된 인증서를 다시 저장했고, DNS 인증 입력 단계가 나타나지 않았습니다.",
    points: [
      "이번 기록의 캐시 사용은 단순히 만료일까지 기간이 남아서 인증이 생략된 경우와 구분합니다. 인증서를 새로 발급했는지, 캐시에서 내보냈는지는 실행 로그와 파일의 인증서 정보를 확인합니다.",
      "생성 파일 중 -crt.pem은 서버 인증서, -key.pem은 개인키, -chain.pem은 서버 인증서와 중간 인증서 체인을 함께 담습니다.",
      "Next renewal due는 도구가 표시하는 다음 갱신 예정일입니다. 실제 인증서 만료일과 같은 값으로 취급하지 않습니다.",
    ],
    commands: [
      {
        title: "PowerShell · 생성된 인증서 파일 확인",
        code: 'Get-ChildItem "D:\\nginx\\ssl\\example.com"',
      },
    ],
  },
  {
    id: "apply",
    label: "서비스 적용",
    title: "Nginx 설정을 검사하고 실제 접속 인증서를 확인합니다",
    description:
      "인증서 파일이 생성되어도 실행 중인 웹서버에 바로 적용되는 것은 아닙니다. 다음은 저장 후 수행할 적용·검증 절차입니다. Nginx가 새 인증서와 개인키를 참조하도록 설정하고, 설정 검사가 성공한 경우에만 다시 읽도록 요청합니다.",
    points: [
      "ssl_certificate에는 인증서 체인을 포함한 -chain.pem을, ssl_certificate_key에는 -key.pem을 연결합니다. 실제 생성된 파일명과 활성 설정 파일을 확인합니다.",
      "명령은 실제 Nginx 실행 폴더에서 수행합니다. 별도 설정 파일이나 실행 경로 옵션(-c, -p)을 사용하는 환경에서는 기존 실행 방식과 동일하게 지정합니다.",
      "설정 검사에 실패하면 경로·권한·인증서와 개인키의 일치 여부를 확인하고 수정합니다. 성공한 뒤 reload를 실행하고 오류 로그도 확인합니다.",
      "브라우저로 실제 HTTPS 주소에 새로 접속해 인증서의 대상 도메인과 만료일을 확인합니다. 파일 저장 성공과 서비스에서 새 인증서를 제공하는 상태를 각각 확인하는 것이 완료 기준입니다.",
    ],
    commands: [
      {
        title: "Nginx · HTTPS server 블록의 인증서 경로 예시",
        code: "ssl_certificate D:/nginx/ssl/example.com/example.com-chain.pem;\nssl_certificate_key D:/nginx/ssl/example.com/example.com-key.pem;",
      },
      {
        title: "PowerShell · 활성 설정 확인 및 검사 성공 시 적용",
        code: '.\\nginx.exe -T 2>&1 | Select-String "ssl_certificate"\n.\\nginx.exe -t\nif ($LASTEXITCODE -eq 0) {\n    .\\nginx.exe -s reload\n}',
      },
    ],
  },
];
