# 로컬 MCP 개발 및 연결 규칙

## 기본 원칙
- 로컬 프로젝트 작업은 Yujaemin Local MCP를 우선 사용한다.
- Codex는 사용자의 명시적인 사전 승인 없이 사용하지 않는다.
- ChatGPT Work로 전환하거나 다른 도구로 임의 우회하지 않는다.
- MCP 도구 또는 권한이 부족하면 필요한 도구·권한을 추가하는 방법을 안내한다.
- 작업 결과에 Codex/Work 사용 여부를 밝힌다.

## 설치 및 버전 관리
- `mcp-create.sh`가 MCP 서버와 플러그인을 생성한다.
- 현재 문서에 기록된 목표 버전은 `1.2.9`이며, 이후 버전 변경 요청 시 마지막 숫자를 1씩 증가시킨다.
- 서버에 버전 문자열을 별도로 하드코딩하지 않는다.
- 신규 도구는 소스 등록 및 빌드 결과에서 확인하고, tools/list 등 등록 검증을 수행한다.

## 다중 프로젝트 운영 (1.2.8)

- 설치 스크립트는 기존 `devlog`와 `~/Downloads/calendar`를 **명시적으로 등록**한다. 후자의 절대 경로는 설치 시 `CALENDAR_PROJECT_ROOT` 환경변수로 변경할 수 있다.
- Git Bash에서 `cd /c/Users/jaemi/Documents/project/devlog && MCP_ACTIVE_PROJECT=calendar bash ./mcp-create.sh`를 실행하면 Calendar를 활성 프로젝트로 등록해 빌드·터널 재연결까지 진행한다. 기존 VS Code `.vscode/mcp.json`의 Yujaemin Local 설정이 존재하면 덮어쓰지 않는다.
- `list_projects`는 등록된 프로젝트와 디렉터리 존재 여부를 조회한다. `switch_project({ projectId: "calendar" })`는 설치된 MCP의 `config.json`에 활성 프로젝트만 저장한다.
- 현재 MCP 프로세스는 재연결까지 원래 루트에 고정된다. **프로젝트를 바꾼 뒤 반드시 재연결 또는 DEVLOG 루트에서 `bash mcp-create.sh`를 다시 실행**해야 한다.
- `MCP_ACTIVE_PROJECT` 환경변수는 **필수**이며 `devlog` 또는 `calendar`만 허용한다. 누락되거나 잘못된 경우 파일을 변경하기 전에 즉시 오류로 종료한다. 이전 `activeProject`를 자동으로 선택하지 않는다.
- 설정 생성 시 임시 파일에 먼저 작성·검증하고, 성공한 경우에만 설치된 `config.json`을 교체한다. 실패해도 기존 설정을 비우거나 덮어쓰지 않는다.
- 프로젝트별 `package.json`의 승인된 scripts를 설치 시 스냅샷으로 저장한다. 새 프로젝트의 scripts를 변경했다면 재설치로 승인을 갱신한다.
- 프로젝트 파일 접근과 Git 작업은 현재 활성 프로젝트 루트 내부만 허용한다. 설정에 없는 임의 경로를 `switch_project`로 지정할 수 없다.
- Jira 인증 정보는 기존 DEVLOG의 로컬 비밀 파일을 그대로 사용하되, Calendar가 활성화되면 기본 이슈 프로젝트는 `CAL`로 분리한다. 토큰 파일은 Calendar 저장소로 복사하지 않는다.
- `jira_create_project`는 Jira 관리자 권한과 명시적 `confirm: true`가 필요하다.
- `git_init`은 현재 프로젝트에 .git이 없는 경우만 허용한다. `github_create_repo`는 GitHub CLI(`gh`)에 로그인되어 있어야 하며 **Private 저장소만 생성**한다. 자동 Push는 지원하지 않는다.
- 새 도구는 `mcp-create.sh` 재설치 및 터널 재연결 뒤에 사용 가능하며, 과제의 `pnpm install && pnpm dev`는 현재 MCP의 명령 허용 목록에 없어 별도 지원이 필요하다.

## 로컬 HTTP API 요청 (1.2.9)

- `http_request`는 **현재 활성 프로젝트에 등록된** `apiBaseUrl`로만 요청하며 임의 URL이나 외부 호스트는 허용하지 않는다.
- Calendar 프로젝트의 기본 API 주소는 `http://127.0.0.1:3000`이다. `devlog`는 API 주소가 설정되지 않아 호출 시 오류를 반환한다.
- 경로는 `/api/`로 시작해야 하며 외부 호스트·상위 디렉터리·리디렉션 우회를 차단한다. 입력 가능한 HTTP 메서드는 GET, POST, PUT, PATCH, DELETE다.
- 로그인 `POST /api/v1/signin`에서 받은 `jwt` 쿠키는 **MCP 프로세스 메모리에서만** 저장한다. 같은 서버 프로세스에서 후속 요청에 자동 첨부하고 로그/응답에는 출력하지 않는다. MCP 재연결 후에는 다시 로그인해야 한다.
- `useSession: false`로 쿠키 없는 요청을 보낼 수 있다. API Key 인증을 구현하면 `headers.Authorization`에 Bearer 토큰을 전달할 수 있다.
- 네트워크 타임아웃 1~30초(기본 10초), 요청 body/응답 본문 최대 1 MiB, 리디렉션 수동 처리로 제한한다.
- 첫 적용은 `devlog` 루트에서 `MCP_ACTIVE_PROJECT=calendar bash ./mcp-create.sh`를 실행한다. 설치 스크립트는 빌드된 MCP의 `tools/list`에서 `http_request` 등록 여부까지 검증한다.

## Tunnel 재시작과 연결 검증
1. 기존 tunnel-client 종료 및 종료 확인.
2. 로그 파일 삭제를 최대 10회 재시도.
3. 파일 잠금 발생 시 고아 MCP `node.exe`를 확인하고 안전하게 정리.
4. `tunnel-client doctor` 실행.
5. tunnel-client 재시작 및 프로세스 생존 확인.
6. `/readyz` HTTP 200으로 실제 연결 준비 확인. `/healthz`만으로 성공 판단하지 않는다.
7. 실패 시 stdout/stderr 최근 로그 확인.

## 디렉터리 생성 도구
- `create_directory`는 프로젝트 내부의 기존 상위 폴더 아래에 디렉터리 하나를 생성한다.
- 이미 존재하는 경로 또는 심볼릭 링크를 통한 경로는 거부한다.
- 새로운 도구 등록은 `mcp-create.sh`로 재설치하고 새 ChatGPT 세션에서 tools/list를 확인한다.

## 파일 이동 도구
- `move_file`은 기존 프로젝트 내부 디렉터리 사이에서 일반 파일만 이동한다.
- 대상 파일 덮어쓰기 및 심볼릭 링크 이동은 금지하며, 경로는 프로젝트 루트 내부로 제한한다.
- 대상 폴더는 먼저 생성되어 있어야 한다. 다른 볼륨으로의 이동은 지원하지 않는다.
- 파일 이동 후 링크·참조 경로를 별도로 점검한다.

## 세션 도구 캐시
- MCP 변경 뒤 기존 ChatGPT 세션에서 도구 schema가 갱신되지 않을 수 있다.
- 신규 도구가 보이지 않으면 새 세션에서 도구 목록을 확인한다.

## 참고
- [LOCAL_MCP_INSTRUCTIONS.md](../LOCAL_MCP_INSTRUCTIONS.md): 환경별 경로와 구성 정보.
- [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)
