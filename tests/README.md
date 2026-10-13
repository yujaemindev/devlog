# 테스트 디렉터리 안내

- `mcp/tools/`: 로컬 MCP 파일 도구와 도구 등록 테스트
- `mcp/jira/`: Jira 연동 테스트
- `mcp/git/`: Git 조회·스테이징·커밋·Push 및 보안 제약 테스트
- `app/assets/`: 화면 정적 자산 및 배포 경로 테스트
- `app/content/`: 화면 콘텐츠 데이터 테스트

모든 테스트는 `npm run test`로 실행하며, 개별 테스트 결과는 `npm run test:verbose`에서 확인합니다.
폴더를 이동하면 상대 import와 `import.meta.url`을 기준으로 한 경로를 함께 갱신해야 합니다.
