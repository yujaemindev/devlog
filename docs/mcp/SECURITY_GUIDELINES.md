# 인증 정보 및 보안 규칙

## 비밀정보 저장
- Tunnel API key는 프로젝트 루트 `.tunnel-client-api-key`에서 읽으며 코드에 직접 넣지 않는다.
- Jira 설정은 `.jira-config.json`, API token은 `.jira-api-token`에 저장한다.
- 실제 인증 정보 파일은 `.gitignore`에 등록한다.
- 예제 설정에는 실제 토큰이나 개인 비밀정보를 기재하지 않는다.

## 출력 및 변경 제한
- API key, Jira token, Authorization 헤더 등 민감한 값은 채팅, MCP 응답, 로그, 커밋에 노출하지 않는다.
- 키 파일을 읽어야 할 때도 토큰 내용 자체는 출력하지 않는다.
- 저장소 변경 후 민감한 파일이 Git 추적 대상에 포함되지 않았는지 확인한다.

## 로컬 HTTP 도구
- API 주소는 활성 프로젝트에 등록된 `http://127.0.0.1:<port>`만 허용한다. 요청 경로는 `/api/` 하위로 제한하고 HTTP 리디렉션을 따라가지 않는다.
- `jwt` 쿠키는 메모리 내 세션에만 보관하며 MCP 응답, 파일 또는 로그에 저장하지 않는다.
- 임의 `Cookie`, `Host` 등 요청 대상·세션을 우회하는 헤더는 전달하지 않는다.
- 요청 본문에 비밀번호나 API Key가 들어갈 수 있으므로 요청 입력 전체를 디버그 로그에 남기지 않는다.

## 관련 문서
- [LOCAL_MCP_INSTRUCTIONS.md](../LOCAL_MCP_INSTRUCTIONS.md)
- [JIRA_ISSUE_GUIDELINES.md](../jira/JIRA_ISSUE_GUIDELINES.md)
