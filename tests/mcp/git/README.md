# Git MCP 테스트

`local-mcp-git.test.js`는 Git MCP 도구의 다음 동작을 검증합니다.

- `git_status`, `git_diff`, `git_log` 조회 명령 구성
- `git_add`의 프로젝트 내부 경로 제한
- `git_commit` 메시지 전달
- `git_push`의 명시적 확인 및 강제 Push 방지
- 외부 저장소, 외부 Git 설정, alternates 차단

테스트는 임시 프로젝트에 `.git` 디렉터리를 만들고, Git 명령 실행 결과를 모의 함수로 제공합니다.
**실제 프로젝트에 스테이징·커밋하거나 원격 저장소에 Push하지 않습니다.**
