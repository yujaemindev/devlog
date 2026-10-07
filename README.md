# 유재민 Devlog

유재민의 경력, 프로젝트, 기술 경험을 정리한 Nuxt 기반 개인 블로그입니다.

## 현재 기술 스택

- Nuxt 4
- Vue 3 (Nuxt에서 관리)
- Nuxt Content 3
- Nuxt Image 2
- Tailwind CSS 4 + `@tailwindcss/vite`
- TypeScript 6.0.3 (ESLint/Vue 검사 도구 호환 버전)
- ESLint 10 + `@nuxt/eslint`
- GitHub Actions + GitHub Pages

> Node.js 24 이상을 사용합니다. `.nvmrc`에는 `24`가 지정되어 있습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

GitHub Pages용 기본 경로가 `/devlog/`이므로 로컬에서 사이트를 `/` 기준으로 확인하려면 환경변수를 사용할 수 있습니다.

macOS/Linux:

```bash
NUXT_APP_BASE_URL=/ npm run dev
```

Windows PowerShell:

```powershell
$env:NUXT_APP_BASE_URL="/"
npm run dev
```

## 정적 빌드

```bash
npm run typecheck
npm run generate:pages
```

GitHub Pages 빌드 결과는 `.output/public`에 생성됩니다.

## GitHub Pages 자동 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 실행됩니다.

최초 1회 GitHub 저장소에서 다음 설정이 필요합니다.

1. `Settings > Pages`
2. `Build and deployment > Source`
3. **GitHub Actions** 선택
4. `main` 브랜치에 push
5. `Actions` 탭에서 `Deploy Nuxt to GitHub Pages` 성공 여부 확인

배포 주소:

`https://yujaemindev.github.io/devlog/`

## 주요 명령어

```bash
npm run dev             # 개발 서버
npm run build           # Nuxt production build
npm run generate        # 정적 generate
npm run generate:pages  # GitHub Pages preset 빌드
npm run typecheck       # Nuxt/Vue TypeScript 검사
npm run lint            # ESLint 검사
npm run lint:fix        # ESLint 자동 수정
npm test                # 테스트 1회 실행
npm run test:watch      # 파일 변경 시 테스트 재실행
```

## Code Style

Vue/Nuxt 작성 규칙과 ESLint 기준은 [`docs/CODE_STYLE.md`](./docs/CODE_STYLE.md)를 참고하세요.

기본 규칙은 `<script setup>` Composition API, PascalCase 컴포넌트, 공백 2칸, double quote, 세미콜론 사용입니다.

## Yujaemin Local MCP

로컬 MCP 개발 환경, Tunnel 구성, 도구 및 세션 인계 사항은 [`docs/LOCAL_MCP_INSTRUCTIONS.md`](./docs/LOCAL_MCP_INSTRUCTIONS.md)를 참고하세요.

### MCP 개발 소스와 배포 방식

MCP 서버는 **개발할 때는 모듈로 분리하고, 배포할 때는 하나의 `server.mjs`로 번들링**합니다.

개발 소스는 다음 위치에 있습니다.

```text
mcp-src/
├─ server.mjs
├─ runtime/
│  └─ node-runtime.mjs
├─ tools/
│  ├─ alias-tools.mjs
│  ├─ command-tools.mjs
│  ├─ copy-image.mjs
│  ├─ dev-server-tools.mjs
│  ├─ file-tools.mjs
│  ├─ git-tools.mjs
│  ├─ nvm-tools.mjs
│  └─ rename-file.mjs
└─ utils/
   ├─ path-security.mjs
   └─ process.mjs
```

`mcp-create.sh`를 실행하면 다음 순서로 설치됩니다.

1. `mcp-src/` 개발 소스를 플러그인 작업 디렉터리로 복사합니다.
2. 플러그인 버전을 `mcp-src/server.mjs`에 반영합니다.
3. MCP SDK, Zod, esbuild를 설치합니다.
4. esbuild로 모든 모듈을 **단일 `server.mjs`**로 번들링합니다.
5. `initialize`와 `tools/list`를 호출해 빌드 결과를 검증합니다.
6. 검증이 끝나면 임시 개발 소스와 빌드 의존성을 제거합니다.

최종 런타임은 다음 파일을 사용합니다.

```text
~/.codex/plugins/yujaemin-local/
├─ server.mjs       # 모듈이 합쳐진 단일 MCP 서버 파일
├─ config.json
├─ .mcp.json
└─ .codex-plugin/
   └─ plugin.json
```

따라서 **소스 코드는 유지보수와 테스트를 위해 분리**되어 있지만, 실제 MCP 서버 실행에는 번들된 `server.mjs` 하나만 사용됩니다.

다른 PC에 처음 설치할 때는 이 저장소를 복제한 뒤 `mcp-create.sh`를 실행하는 방식을 권장합니다. 이미 Yujaemin Local 플러그인 설정이 완료된 PC에서 서버 코드만 갱신하는 경우에는 빌드·검증된 `server.mjs`만 교체할 수 있습니다. 프로젝트 경로, 플러그인 버전, manifest 또는 Tunnel 설정이 바뀌는 경우에는 `mcp-create.sh`를 다시 실행해야 합니다.

테스트에서는 더 이상 `mcp-create.sh` 문자열을 `slice()`로 잘라 VM에서 실행하지 않습니다. `mcp-src/tools/`와 `mcp-src/utils/`의 실제 모듈을 직접 import해 배포 서버가 사용하는 구현과 같은 코드를 검증합니다.

## Nuxt 4 / 최신 의존성 업그레이드

기존 Nuxt 3 프로젝트에서 Nuxt 4 구조로 마이그레이션했습니다. 주요 변경 내역은 [`UPGRADE_NUXT4.md`](./UPGRADE_NUXT4.md)를 참고하세요.