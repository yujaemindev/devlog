# 유재민 Devlog

유재민의 경력, 프로젝트, 기술 경험을 정리한 Nuxt 기반 개인 블로그입니다.

## 현재 기술 스택

- Nuxt 4
- Vue 3 (Nuxt에서 관리)
- Nuxt Content 3
- Nuxt Image 2
- Tailwind CSS 4 + `@tailwindcss/vite`
- TypeScript 7
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
```

## Nuxt 4 / 최신 의존성 업그레이드

기존 Nuxt 3 프로젝트에서 Nuxt 4 구조로 마이그레이션했습니다. 주요 변경 내역은 [`UPGRADE_NUXT4.md`](./UPGRADE_NUXT4.md)를 참고하세요.
