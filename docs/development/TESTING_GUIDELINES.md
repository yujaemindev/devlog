# 테스트 및 검증 규칙

## 기본 검증
- 실행 가능한 명령은 `package.json` scripts를 기준으로 한다.
- 일반 코드 변경 후 `npm run lint`, `npm run typecheck`, `npm test`를 검토·실행한다.
- `npm run test`는 테스트 파일별 요약을 출력하고, `npm run test:verbose`는 각 테스트의 한글 설명과 실행 시간 등 상세 결과를 출력한다.
- GitHub Pages 경로 또는 정적 자산 변경 시 `npm run test:pages`도 실행한다.
- 페이지 생성 또는 정적 빌드 관련 변경 시 `npm run generate:pages`를 검토한다.
- 코드 스타일 수정은 [CODE_STYLE.md](./CODE_STYLE.md)를 따른다.

## 테스트 파일 구조

- `tests/mcp/tools/`: 로컬 MCP 파일 관리 및 도구 등록 검증.
- `tests/mcp/jira/`: Jira REST 클라이언트의 정상 동작·인증/조회/변경 오류 및 MCP 도구 입력 스키마 검증 (모의 응답, 실제 Jira 호출 없음).
- `tests/mcp/git/`: Git MCP 도구 등록·명령 인자·경로 및 설정 보안 검증 (실제 Push 없음).
- `tests/app/assets/`: 화면 정적 자산 및 GitHub Pages 경로 검증.
- `tests/app/content/`: 화면 콘텐츠 데이터 검증.
- `tests/README.md`: 전체 테스트 디렉터리 안내.

테스트를 이동할 때는 상대 import 경로와 `import.meta.url` 기반 경로를 함께 수정한다.

## MCP 변경 검증
- 서버 소스와 번들 결과의 문법을 확인한다.
- 도구 추가·수정 시 등록 테스트와 tools/list 결과를 확인한다.
- 터널 연결 성공은 `/readyz` HTTP 200을 기준으로 한다.

## 결과 보고
- 수행한 검사와 성공·실패·미실행 항목을 구분한다.
- 검사 환경 또는 권한 제한으로 실행할 수 없으면 이를 명시한다.
