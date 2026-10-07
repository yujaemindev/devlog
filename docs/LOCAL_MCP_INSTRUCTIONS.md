# Yujaemin Local MCP 작업 명령

## 1. 가장 중요한 규칙

로컬 프로젝트 작업은 `Yujaemin Local` MCP 플러그인을 사용한다.

**Codex는 사용자가 명시적으로 허용하기 전에는 절대 사용하지 않는다.**

Codex 사용이 필요하다고 판단되는 경우에도:

1. 먼저 사용자에게 Codex 사용이 필요하다고 알린다.
2. 사용자의 승인을 받는다.
3. 승인 후에만 Codex를 사용한다.

일반적인 파일 읽기/수정, Git 조회/commit/push, 개발 서버 실행은 가능한 한 `Yujaemin Local` MCP로 처리한다.

## 2. 프로젝트 내 작업 위치 찾기

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

Tunnel API key는 코드에 직접 넣지 않는다.

프로젝트 루트의 다음 파일에서 읽는다.

```text
.tunnel-client-api-key
```

이 파일은 `.gitignore`에 등록되어 있어야 한다.

**API Key 값은 채팅, 로그, Git commit에 출력하거나 포함시키지 않는다.**

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

프로젝트의 `mcp-create.sh`가 MCP 서버/플러그인을 생성한다.

현재 목표 버전은 `1.2.3`이다.

버전 업데이트 요청 시 마지막 숫자를 1씩 올린다.

```text
1.2.3 → 1.2.4 → 1.2.5 → ...
```

앞으로 버전을 변경할 때 MCP 서버에 버전 문자열을 별도로 하드코딩하지 않는다.

Git push는 사용자가 명시적으로 요청한 경우에만 수행한다.

## 6. Tunnel 자동 재시작

`mcp-create.sh` 마지막에 tunnel-client 자동 재시작 기능을 추가했다.

동작:

1. 기존 `tunnel-client` 프로세스 종료
2. tunnel-client `doctor` 실행
3. 새 tunnel-client 백그라운드 실행
4. 실행 여부 확인

MCP command:

```text
command=node C:/Users/jaemi/.codex/plugins/yujaemin-local/server.mjs,channel=main
```

Tunnel ID:

```text
tunnel_6ac4b1cabb1c81918b63712568faac31
```

## 7. ChatGPT 세션의 MCP schema 캐시

기존 ChatGPT 세션에서는 MCP가 업데이트되어도 tool schema가 이전 상태로 유지되는 현상이 있었다.

서버나 Tunnel 자체보다 **기존 ChatGPT 세션의 MCP tool schema 캐시 문제**로 판단한다.

MCP 도구 추가/변경 후 기존 세션에서 보이지 않는다면 새 세션에서 확인한다.
