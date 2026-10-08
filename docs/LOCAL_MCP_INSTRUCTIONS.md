# Yujaemin Local MCP 작업 명령

## 규칙 문서 목차

이 문서는 로컬 MCP 운영의 진입점이다. 상세 규칙은 해당 문서를 우선 확인한다.

- [JIRA_ISSUE_GUIDELINES.md](./jira/JIRA_ISSUE_GUIDELINES.md) — Jira 이슈 구조와 라벨 운영
- [CODE_STYLE.md](./development/CODE_STYLE.md) — Vue/Nuxt 및 JS 코드 스타일
- [GIT_WORKFLOW.md](./git/GIT_WORKFLOW.md) — Git 커밋·Push·변경사항 관리
- [FILE_EDITING_RULES.md](./development/FILE_EDITING_RULES.md) — 프로젝트 탐색과 안전한 파일 수정
- [MCP_DEVELOPMENT.md](./mcp/MCP_DEVELOPMENT.md) — MCP 도구·버전·터널·스키마 갱신
- [TESTING_GUIDELINES.md](./development/TESTING_GUIDELINES.md) — 테스트와 검증
- [SECURITY_GUIDELINES.md](./mcp/SECURITY_GUIDELINES.md) — 인증 정보와 로그 보안

## 1. 가장 중요한 규칙

로컬 프로젝트 작업은 `Yujaemin Local` MCP 플러그인을 사용한다.

**Codex는 사용자가 명시적으로 허용하기 전에는 절대 사용하지 않는다.**

Codex 사용이 필요하다고 판단되는 경우에도:

1. 먼저 사용자에게 Codex 사용이 필요하다고 알린다.
2. 사용자의 승인을 받는다.
3. 승인 후에만 Codex를 사용한다.

일반적인 파일 읽기/수정, Git 조회/commit/push, 개발 서버 실행은 가능한 한 `Yujaemin Local` MCP로 처리한다.

새 폴더는 `create_directory`로 생성한다. 기존 폴더의 하위에만 생성할 수 있으며 동일 경로가 이미 있으면 실패한다.

폴더 간 일반 파일 이동은 `move_file`을 사용한다. 이동 전 대상 폴더가 존재하는지 확인하고, 이동 후 Markdown 링크와 import 등 참조 경로를 함께 수정한다. 이동 도구의 세부 제약은 [MCP_DEVELOPMENT.md](./mcp/MCP_DEVELOPMENT.md)를 참고한다.

### ChatGPT Work 및 도구 우회 금지

1. 로컬 프로젝트 작업은 일반 ChatGPT 대화에서 `Yujaemin Local` MCP를 우선 사용한다.
2. ChatGPT Work 모드로 전환하거나 Work를 통해 프로젝트 작업을 수행하지 않는다.
3. 로컬 MCP에 필요한 도구 또는 권한이 없을 경우 다른 ChatGPT 앱·플러그인·실행 환경으로 자동 우회하지 않는다.
4. 대신 로컬 MCP에 추가할 도구, 필요한 API 권한과 설정·검증 절차를 사용자에게 안내한다.
5. Codex가 필요할 때는 기존 원칙대로 실행 전에 사용자의 명시적 승인을 받는다.
6. 작업 결과에 Codex와 ChatGPT Work 사용 여부를 명시한다.

이 규칙은 프로젝트 작업 지침이며 ChatGPT의 상위 실행 정책이나 Work 전환 기능 자체를 기술적으로 차단하지 않는다.

## 2. 프로젝트 내 작업 위치 찾기

파일 탐색 및 수정 절차의 상세 기준은 **[FILE_EDITING_RULES.md](./development/FILE_EDITING_RULES.md)** 를 따른다.

사용자가 화면의 제목, 문구, 기능명 또는 특정 항목을 기준으로 수정을 요청했을 때 **정확한 문자열 검색 1회 결과만으로 해당 코드가 없다고 판단하지 않는다.**

찾는 순서는 다음과 같다.

1. 사용자가 제공한 정확한 문구로 프로젝트 전체를 검색한다.
2. 결과가 없으면 문구의 핵심 단어, 영문/한글 표현, URL/path, 메뉴명 등으로 검색 범위를 넓힌다.
3. 메뉴/라우트/페이지 파일을 먼저 찾아 실제 화면을 구성하는 컴포넌트와 데이터 파일까지 추적한다.
4. `git_status`로 현재 수정 중인 파일을 확인해 사용자가 직전에 작업한 변경사항과 관련된 파일인지 함께 확인한다.
5. 관련 가능성이 높은 파일은 반드시 `read_file`로 내용을 확인한 뒤 수정 위치를 결정한다.
6. 위 과정을 수행한 뒤에도 찾지 못한 경우에만 사용자에게 파일 위치나 추가 정보를 요청한다.

특히 화면에 표시되는 문구가 데이터 조합, 컴포넌트 props, 번역, 런타임 데이터 등으로 생성될 수 있으므로 **검색 결과 없음 = 해당 기능/화면 없음**으로 간주하지 않는다.

## 3. API Key 보안

인증 정보 저장·비노출 규칙의 상세 기준은 **[SECURITY_GUIDELINES.md](./mcp/SECURITY_GUIDELINES.md)** 를 따른다.

Tunnel API key는 코드에 직접 넣지 않는다.

프로젝트 루트의 다음 파일에서 읽는다.

```text
.tunnel-client-api-key
```

Jira 연동 정보도 코드에 직접 넣지 않는다.

```text
.jira-config.json
.jira-api-token
```

`.jira-config.json`에는 Jira Cloud URL, 계정 email, 기본 project key만 저장하고 `.jira-api-token`에는 API token 값만 저장한다. 두 파일 모두 `.gitignore`에 등록되어 있어야 한다.

**API Key와 Jira API token 값은 채팅, 로그, Git commit에 출력하거나 포함시키지 않는다.**

## 3. 새 세션에서 이어서 작업할 때

1. `Yujaemin Local` MCP의 현재 tool 목록 확인
2. `start_dev_server` 존재 확인
3. 존재하면 `start_dev_server` 실행
4. `dev_server_status`로 실행 상태와 Nuxt 로그 확인
5. Nuxt 개발 서버를 계속 실행 상태로 유지

이 작업에서는 **Codex를 사용하지 않는다.**

MCP로 처리할 수 없는 상황에서 Codex가 필요하다면 반드시 사용자에게 먼저 알리고 승인을 받아야 한다.

## 4. 현재 MCP 구성

- 플러그인 이름: `Yujaemin Local`
- 내부 plugin name: `yujaemin-local`
- OpenAI Tunnel ID: `tunnel_6ac4b1cabb1c81918b63712568faac31`
- Tunnel 이름: `local mcp tunnel`
- MCP 서버: `C:\Users\jaemi\.codex\plugins\yujaemin-local\server.mjs`
- Tunnel client: `C:\Users\jaemi\Downloads\tunnel-client-v0.0.15-windows-amd64`
- Tunnel client 버전: `v0.0.15-windows-amd64`
- Tunnel client UI: `http://127.0.0.1:8080/ui`

## 5. mcp-create.sh

개발·버전 관리·터널 검증의 상세 규칙은 **[MCP_DEVELOPMENT.md](./mcp/MCP_DEVELOPMENT.md)** 를 따른다.

프로젝트의 `mcp-create.sh`가 MCP 서버/플러그인을 생성한다.

현재 목표 버전은 `1.2.7`이다.

버전 업데이트 요청 시 마지막 숫자를 1씩 올린다.

```text
1.2.7 → 1.2.8 → 1.2.9 → ...
```

앞으로 버전을 변경할 때 MCP 서버에 버전 문자열을 별도로 하드코딩하지 않는다.

Git push는 사용자가 명시적으로 요청한 경우에만 수행한다.

## 6. Tunnel 자동 재시작

`mcp-create.sh` 마지막에서 tunnel-client를 안전하게 재시작한다.

동작:

1. 기존 `tunnel-client`를 강제 종료하고 실제 프로세스 종료를 확인한다.
2. 이전 `tunnel-client.log`, `tunnel-client.log.err` 삭제를 최대 10회 재시도한다.
3. 로그 파일이 계속 잠겨 있으면 Yujaemin Local MCP의 고아 `node.exe`를 조회하고 해결 명령을 콘솔에 출력한다.
4. tunnel-client `doctor`를 실행한다.
5. 새 tunnel-client를 백그라운드로 실행한다.
6. 프로세스가 비정상 종료되지 않았는지 확인한다.
7. 최대 30초 동안 `http://127.0.0.1:8080/readyz`가 HTTP 200을 반환하는지 확인한다.
8. ready 실패 시 stderr/stdout 최근 로그를 출력하고 설치를 실패 처리한다.

Windows에서는 tunnel-client가 종료되어도 `node C:/Users/jaemi/.codex/plugins/yujaemin-local/server.mjs` 프로세스가 고아로 남아 로그 파일 핸들을 계속 잡는 경우가 있다. 이 경우 `mcp-create.sh`가 현재 고아 프로세스를 출력하고 다음 PowerShell 조치를 안내한다.

```powershell
Get-CimInstance Win32_Process |
Where-Object {
    $_.Name -eq "node.exe" -and
    $_.CommandLine -like "*yujaemin-local*server.mjs*"
} |
ForEach-Object {
    taskkill /PID $_.ProcessId /T /F
}
```

고아 프로세스 종료 후 같은 조회 명령에서 아무 프로세스도 나오지 않는지 확인한 뒤 `mcp-create.sh`를 다시 실행한다.

`/healthz`는 프로세스 생존 여부만 의미하므로 연결 성공 판단에 사용하지 않는다. `/readyz` 200을 실제 MCP/control-plane 준비 완료 기준으로 사용한다.

MCP command:

```text
command=node C:/Users/jaemi/.codex/plugins/yujaemin-local/server.mjs,channel=main
```

Tunnel ID:

```text
tunnel_6ac4b1cabb1c81918b63712568faac31
```

## 7. Jira 연동

Yujaemin Local MCP는 Jira Cloud REST API를 직접 호출한다.

설정 예시는 저장소의 `.jira-config.example.json`을 사용한다.

```json
{
  "baseUrl": "https://your-site.atlassian.net",
  "email": "your-email@example.com",
  "defaultProjectKey": "DEVLOG"
}
```

실제 설정은 프로젝트 루트의 `.jira-config.json`에 저장하고 Jira API token은 `.jira-api-token`에 한 줄로 저장한다. `mcp-create.sh`는 실행 초기에 `.jira-api-token` 파일이 없거나 공백만 있어 실질적으로 비어 있으면 오류로 종료한다.

지원 도구:

- `jira_status`
- `jira_list_projects`
- `jira_list_issue_types`
- `jira_search_issues`
- `jira_get_issue`
- `jira_create_issue`
- `jira_create_subtask`
- `jira_update_issue`
- `jira_delete_issue` (DEVLOG-24~26 중 하위 이슈가 없는 Epic만 삭제)
- `jira_add_labels`
- `jira_assign_issue`
- `jira_list_transitions`
- `jira_transition_issue`

DEVLOG Jira 이슈 계층 구조, 메뉴별 부모·자식 관계, 라벨 명명 규칙, 등록·변경·삭제 절차는 별도 문서인 **[JIRA_ISSUE_GUIDELINES.md](./jira/JIRA_ISSUE_GUIDELINES.md)** 를 따른다.

Jira 이슈를 생성·수정·삭제하기 전에 해당 문서를 확인하고, 운영 규칙 변경 시 이 문서를 함께 갱신한다.

Jira API token이나 Authorization 헤더는 어떤 MCP 응답에도 출력하지 않는다.

## 8. ChatGPT 세션의 MCP schema 캐시

관련 대응 규칙은 **[MCP_DEVELOPMENT.md](./mcp/MCP_DEVELOPMENT.md)** 에서 관리한다.

기존 ChatGPT 세션에서는 MCP가 업데이트되어도 tool schema가 이전 상태로 유지되는 현상이 있었다.

서버나 Tunnel 자체보다 **기존 ChatGPT 세션의 MCP tool schema 캐시 문제**로 판단한다.

MCP 도구 추가/변경 후 기존 세션에서 보이지 않는다면 새 세션에서 확인한다.
