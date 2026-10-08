# Repository Map

Nuxt 4 기반 개인 개발 블로그입니다. 먼저 `README.md`에서 실행 방법과 배포 개요를 확인하고, 작업 대상에 따라 아래 위치를 살펴보세요.

## Where to Look

- 페이지 구성: `app/pages/`
- 공통 UI와 페이지 컴포넌트: `app/components/`
- 프로젝트·경험·메뉴 데이터: `app/data/`
- 블로그 콘텐츠: `content/`
- 정적 이미지와 데모 파일: `public/`
- 콘텐츠 스키마: `content.config.ts`
- Nuxt 설정과 GitHub Pages 경로: `nuxt.config.ts`
- 배포 설정: `.github/workflows/deploy.yml`
- 데모 빌드 스크립트: `scripts/`
- 프로젝트 구조 변경 이력: `UPGRADE_NUXT4.md`

## ChatGPT 및 MCP 작업 원칙

- 프로젝트 작업은 일반 ChatGPT 대화에서 `Yujaemin Local` MCP를 우선 사용하고 ChatGPT Work로 전환하거나 사용하지 않습니다.
- 필요한 도구나 권한이 로컬 MCP에 없으면 다른 ChatGPT 앱/플러그인으로 자동 우회하지 않고, 로컬 MCP에 기능 또는 권한을 추가하는 방법을 안내합니다.
- Codex는 사용자의 명시적인 사전 승인 없이 사용하지 않습니다.
- 작업 결과에 Codex 및 ChatGPT Work 사용 여부를 명시합니다.
- 전체 작업 규칙의 진입점은 `docs/LOCAL_MCP_INSTRUCTIONS.md`입니다. Git, 파일 수정, MCP 개발, 테스트, 보안 및 Jira 상세 규칙은 해당 문서의 규칙 문서 목차 링크를 따릅니다.

## Common Tasks

- 프로젝트 정보를 수정할 때는 `app/data/`와 이를 사용하는 페이지·컴포넌트를 함께 확인합니다.
- 블로그 글을 수정할 때는 `content/`의 기존 문서 형식을 따릅니다.
- 페이지나 정적 자산 경로를 변경할 때는 `nuxt.config.ts`의 GitHub Pages `baseURL`과 배포 워크플로를 확인합니다.
- 배포 방법은 `GITHUB_PAGES_SETUP.md`를 참고합니다.

## Code Style

- Vue/Nuxt 코드 작성 규칙은 `docs/development/CODE_STYLE.md`를 따릅니다.
- Vue 컴포넌트는 기본적으로 `<script setup>` Composition API를 사용합니다.
- 코드 작성 후 `npm run lint`를 실행하고, 스타일 자동 수정이 필요한 경우 `npm run lint:fix`를 사용합니다.

## Commit Messages

- 커밋 메시지는 수정사항의 핵심을 요약하여 한글로 작성합니다.

## Validation

사용 가능한 검증 명령은 `package.json`의 `scripts`를 기준으로 합니다.

- 코드 변경: `npm run lint`, `npm run typecheck`
- 페이지 또는 정적 생성 관련 변경: 위 명령과 `npm run generate:pages`

- 테스트 실행: `npm test`
- 테스트 감시 모드: `npm run test:watch`