export const routes = [
  {
    path: "/ (정확히 일치)",
    target: "/deepinspector-web/로 301 리다이렉트",
    purpose: "기본 진입점 · 웹서비스로 이동",
  },
  {
    path: "미정의 경로 (예: /unknown)",
    target: "내부 전달 없이 404 반환",
    purpose: "기본 처리 · 더 구체적인 location이 없는 요청에 적용",
  },
  {
    path: "/deepinspector-web/",
    target: "127.0.0.1:10647/deepinspector-web/",
    purpose: "프론트엔드 · 접두어 유지",
  },
  {
    path: "/deepinspector-api/projects",
    target: "127.0.0.1:10646/api/projects",
    purpose: "API · 외부 접두어를 /api/로 치환",
  },
  {
    path: "/deepinspector-swagger/",
    target: "127.0.0.1:10646/deepinspector-swagger/",
    purpose: "API 문서 · 요청 경로 유지",
  },
  {
    path: "/media/…",
    target: "127.0.0.1:10646/media/…",
    purpose: "파노라마 이미지, 영상 등 대용량 파일 · AI분석 및 웹페이지 전달용",
  },
  {
    path: "/assets/…",
    target: "127.0.0.1:10647/deepinspector-web/assets/…",
    purpose: "정적 리소스 · 이미지 웹 캐시",
  },
];

export const steps = [
  {
    id: "gateway-entry",
    label: "진입점",
    title: "하나의 도메인으로 웹과 API 연결",
    description:
      "Windows 환경의 Nginx를 DeepInspector의 공통 진입점으로 구성했습니다. 외부 요청은 deepinspector.ai로 받고, URL 경로에 따라 로컬 프론트엔드와 백엔드에 전달하도록 리버스 프록시를 설정했습니다.",
    points: [
      "웹서비스, API·Swagger·NAS의 포트를 서로 다르게 구성하여 전달해 서비스별 라우팅을 구성했습니다.",
      "루트 경로는 웹서비스의 메인 경로로 설정한 /deepinspector-web/로 이동시키고, 정의되지 않은 경로에는 404를 반환하도록 처리했습니다.",
      "웹과 Swagger 진입 URL의 마지막 슬래시를 301 리다이렉트로 통일했습니다.",
    ],
    code: `location = / { return 301 /deepinspector-web/; }
location = /deepinspector-web { return 301 /deepinspector-web/; }
location = /deepinspector-swagger { return 301 /deepinspector-swagger/; }
location / { return 404; }`,
  },
  {
    id: "gateway-tls",
    label: "HTTPS",
    title: "게이트웨이에서 HTTPS와 TLS 정책 관리",
    description:
      "80 포트 요청을 HTTPS로 전환하고, 443 포트에서 인증서와 개인키를 사용해 TLS를 처리했습니다. 내부 서비스로는 HTTP로 전달해 외부 암호화 연결 설정을 Nginx에 모았습니다.",
    points: [
      "HTTPS 리다이렉트에서 호스트와 요청 URI를 유지했습니다.",
      "GS 인증 1등급 결함 사유였던 보안 문제인 TLS 1.2·1.3만 허용하고 ECDHE 및 AES-GCM·ChaCha20 기반 암호군을 지정했습니다.",
      "반복 접속 시 TLS 핸드셰이크 비용을 줄이기 위해, Nginx 공식 예시를 참고해 세션 캐시 10MB와 재사용 시간 10분을 설정했습니다.",
      "서버 수준에서 1년간의 HSTS와 includeSubDomains를 선언하고, upstream의 HSTS 헤더를 숨겨 정책을 관리하도록 구성했습니다.",
    ],
    code: `return 301 https://$host$request_uri;

# HTTPS 서버 설정 발췌
listen 443 ssl http2;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
proxy_hide_header Strict-Transport-Security;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`,
  },
  {
    id: "gateway-routing",
    label: "경로 설계",
    title: "프론트엔드 접두어 유지와 API 경로 변환",
    description:
      "프론트엔드는 /deepinspector-web/을 유지하고, 외부 API 경로는 백엔드의 /api/로 변환하도록 proxy_pass를 구분했습니다. 서비스의 base 경로와 API 라우트에 맞춰 요청 경로를 연결한 구성입니다.",
    points: [
      "X-Forwarded-Prefix로 외부 base 경로(/deepinspector-web)를 전달했습니다. proxy_pass를 http://127.0.0.1:10647/deepinspector-web/;로 설정한 경우와 같은 요청 경로를 전달합니다.",
      "API는 /deepinspector-api/를 /api/로 치환하고, 슬래시 없는 정확한 /deepinspector-api 요청도 /api/로 연결했습니다.",
      "API·Swagger·미디어·assets에는 Host, X-Forwarded-Host, X-Forwarded-Proto를 전달해 외부 호스트와 프로토콜 정보를 제공했습니다.",
      "proxy_redirect off로 백엔드가 반환하는 이동 주소를 Nginx가 자동으로 바꾸지 않도록 설정했습니다. 루트 경로(deepinspector.ai/)의 웹서비스 이동과 URL 끝의 슬래시 보정은 별도 location에서 301 리다이렉트로 처리했습니다.",
    ],
    code: `location ^~ /deepinspector-web/ {
  include D:/nginx/conf/snippets/proxy_base.conf;
  proxy_pass http://127.0.0.1:10647;
  proxy_redirect off;
  proxy_set_header X-Forwarded-Prefix /deepinspector-web;
}

location /deepinspector-api/ {
  include D:/nginx/conf/snippets/proxy_large_upload.conf;
  include D:/nginx/conf/snippets/proxy_rate_limit.conf;
  proxy_pass http://127.0.0.1:10646/api/;
  proxy_redirect off;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}`,
  },
  {
    id: "gateway-media",
    label: "파일·문서",
    title: "API·미디어 공통 정책과 Swagger 경로 구성",
    description:
      "촬영 데이터와 분석 결과를 다루는 서비스의 API 및 /media/ 경로에 대용량 업로드용 공통 설정 파일을 적용했습니다. Swagger는 백엔드의 문서 경로로 전달하도록 분리했습니다.",
    points: [
      "API와 미디어 location에서 proxy_large_upload.conf를 재사용해 파일 관련 프록시 설정을 공통 파일로 관리했습니다.",
      "Swagger 응답에 X-Debug-Location 헤더를 추가해 해당 location으로 라우팅되는지 확인할 수 있도록 했습니다.",
      "API·미디어에 요청 본문 크기 제한 200g와 각 86400초(24시간)의 타임아웃을 적용했습니다. buffering off로 업로드 시 Nginx가 요청을 모두 수신한 후 백엔드로 전달하지 않고, 수신과 동시에 전달하도록 구성했습니다.",
    ],
    codeTitle: "proxy_large_upload.conf",
    code: `client_max_body_size 200g;
client_body_timeout 86400s;
send_timeout 86400s;

proxy_read_timeout 86400s;
proxy_request_buffering off;`,
    codeDetails: [
      {
        term: "client_body_timeout 86400s",
        description:
          "사용자가 업로드하는 다음 데이터를 Nginx가 기다리는 시간입니다. 요청 본문을 받는 도중 24시간 동안 새 데이터가 들어오지 않으면 요청을 종료합니다.",
      },
      {
        term: "send_timeout 86400s",
        description:
          "Nginx가 사용자에게 응답을 보내는 도중 전송이 다시 진행되기를 기다리는 시간입니다. 사용자가 데이터를 받지 못하는 등 24시간 동안 전송이 진행되지 않으면 연결을 종료합니다.",
      },
      {
        term: "proxy_read_timeout 86400s",
        description:
          "백엔드에서 다음 응답 데이터가 올 때까지 Nginx가 기다리는 시간입니다. 24시간 동안 새 응답 데이터가 오지 않으면 백엔드와의 연결을 종료합니다.",
      },
      {
        term: "전체 처리 시간과의 차이",
        description:
          "세 설정 모두 전체 업로드·다운로드·작업 시간을 24시간으로 제한하는 설정은 아닙니다. 각 구간에서 데이터 수신이나 전송이 계속 진행되면 전체 처리 시간은 24시간을 넘을 수 있습니다.",
      },
    ],
  },
  {
    id: "gateway-assets",
    label: "정적 리소스",
    title: "정적 리소스 경로 보정과 30일 캐시 정책",
    description:
      "브라우저가 /assets/로 요청하는 리소스를 프론트엔드의 /deepinspector-web/assets/로 연결했습니다. 정적 리소스에 30일 캐시 정책을 부여해 반복 요청 시 캐시를 활용할 수 있도록 구성했습니다.",
    points: [
      "expires 30d와 Cache-Control의 public, max-age=2592000으로 클라이언트·공유 캐시 정책을 지정했습니다. 대용량 업로드의 지연시간을 기다리기 위한 설정으로, 최대 24시간을 지정했습니다.",
      "assets 경로에 Access-Control-Allow-Origin과 Timing-Allow-Origin을 *로 설정해 다른 origin의 접근을 허용했습니다.",
    ],
    code: `location ^~ /assets/ {
  include D:/nginx/conf/snippets/proxy_base.conf;
  proxy_pass http://127.0.0.1:10647/deepinspector-web/assets/;
  proxy_redirect off;
  expires 30d;
  add_header Cache-Control "public, max-age=2592000" always;
  add_header Access-Control-Allow-Origin "*" always;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}`,
  },
  {
    id: "gateway-rate-limit",
    label: "Rate limit",
    title: "일반 API 요청의 제한 정책",
    description:
      "조회·수정 등 일반 API의 요청 빈도를 관리해 서비스 부하를 제어하도록 Rate limit 정책을 구성했습니다.",
    points: [
      "일반 API는 Nginx에서 IP별 요청 빈도와 순간적인 요청 증가를 제한하는 방식으로 구성했습니다.",
      "정적 리소스 요청은 API 제한 정책과 분리하고, 제한값은 실제 요청량과 정상 사용 패턴을 기준으로 조정하도록 했습니다.",
    ],
    codeTitle: "Rate limit · 전용 conf 구성",
    code: `# D:/nginx/conf/snippets/rate_limit_zones.conf
# nginx.conf의 http 블록에서 include 됨
limit_req_zone $binary_remote_addr zone=general_api:10m rate=10r/s;

# D:/nginx/conf/snippets/proxy_rate_limit.conf
# location /deepinspector-api/ 블록에서 include 됨
limit_req zone=general_api burst=20 nodelay;
limit_req_status 429;
}`,
    codeDetails: [
      {
        term: "$binary_remote_addr",
        description: "접속 IP를 기준으로 요청을 제한합니다.",
      },
      {
        term: "zone=general_api:10m",
        description:
          "IP별 요청 제한 상태를 저장할 공유 메모리를 10MB 확보(오래된 상태부터 제거됨)하고, 해당 영역의 이름을 general_api로 지정합니다.",
      },
      {
        term: "rate=10r/s",
        description:
          "IP당 초당 평균 10건의 요청을 허용하는 기준입니다. limit_req_zone은 기준을 정의하고, 실제 API location에서는 limit_req로 적용합니다.",
      },
      {
        term: "burst=20 nodelay",
        description:
          "순간적으로 몰리는 초과 요청을 최대 20건까지 지연 없이 허용합니다.",
      },
      {
        term: "limit_req_status 429",
        description:
          "초과 요청 여유분까지 소진되면 429 Too Many Requests 응답을 반환합니다.",
      },
    ],
  },
  {
    id: "gateway-timeout",
    label: "Timeout",
    title: "일반 API·업로드·AI 실행의 대기 시간 분리",
    description:
      "일반 API 응답, 대용량 파일 업로드, 장시간 AI 실행은 처리 특성이 달라 Timeout 정책을 구분했습니다.",
    points: [
      "일반 API는 연결과 응답 대기 시간을 제한해 응답하지 않는 요청이 오래 유지되지 않도록 했습니다.",
      "업로드는 파일 크기와 전송 속도를 고려한 별도 정책을 적용하고, proxy_large_upload.conf에서 파일 관련 프록시 설정을 관리했습니다.",
      "Worker의 실행은 DB에서 작업 등록과 실제 분석을 분리해 비동기로 처리하고, 작업 상태 조회와 워커의 실행 시간 관리로 연결했습니다.",
    ],
  },
  {
    id: "gateway-operations",
    label: "운영",
    title: "로그 관리 지점 정리",
    description: "도메인 전용 access_log와 error_log를 분리했습니다.",
    points: [
      "deepinspector_access.log에 main 형식으로 요청을 기록하고, deepinspector_error.log에 Nginx 오류를 기록하도록 설정했습니다.",
    ],
    code: `access_log D:/nginx/logs/deepinspector_access.log main;
error_log D:/nginx/logs/deepinspector_error.log;`,
  },
  {
    id: "gateway-worker-resilience",
    label: "워커 장애 대응",
    title: "워커에서 Circuit breaker와 Retry 처리",
    description:
      "AI 작업의 Circuit breaker와 Retry는 워커에서 Redis와 MySQL을 활용해 처리했습니다. 게이트웨이에서 요청 유입과 대기 시간을 관리하고, 워커에서 작업 실행 중의 장애 제어와 재시도를 담당하도록 구성했습니다.",
  },
];
