# 테스트 및 검증 규칙

## 기본 검증
- 실행 가능한 명령은 `package.json` scripts를 기준으로 한다.
- 일반 코드 변경 후 `npm run lint`, `npm run typecheck`, `npm test`를 검토·실행한다.
- GitHub Pages 경로 또는 정적 자산 변경 시 `npm run test:pages`도 실행한다.
- 페이지 생성 또는 정적 빌드 관련 변경 시 `npm run generate:pages`를 검토한다.
- 코드 스타일 수정은 [CODE_STYLE.md](./CODE_STYLE.md)를 따른다.

## MCP 변경 검증
- 서버 소스와 번들 결과의 문법을 확인한다.
- 도구 추가·수정 시 등록 테스트와 tools/list 결과를 확인한다.
- 터널 연결 성공은 `/readyz` HTTP 200을 기준으로 한다.

## 결과 보고
- 수행한 검사와 성공·실패·미실행 항목을 구분한다.
- 검사 환경 또는 권한 제한으로 실행할 수 없으면 이를 명시한다.
