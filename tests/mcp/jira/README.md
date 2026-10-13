# MCP Jira 연동 테스트

실제 Jira 서버에 접속하지 않고 모의 HTTP 응답과 임시 설정 파일로 검증합니다.

- `local-mcp-jira.test.js`: 기존 인증, 이슈 생성·부모 관계·담당자·상태 변경·삭제 테스트
- `local-mcp-jira-validation.test.js`: 설정·토큰·HTTP 오류, 검색·페이지네이션, 라벨 병합, 삭제 안전장치
- `local-mcp-jira-tools.test.js`: MCP 도구 13개의 등록, 입력 스키마, 권한 힌트 및 클라이언트 호출 전달

테스트 중 실제 Jira 이슈를 변경하거나 삭제하지 않습니다.

