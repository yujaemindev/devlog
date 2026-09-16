# Nuxt 4 및 최신 Node Modules 업그레이드 내역

업데이트 기준일: 2026-09-16

## 주요 버전

| Package | 적용 버전 |
| --- | ---: |
| Nuxt | 4.5.2 |
| @nuxt/content | 3.16.0 |
| @nuxt/image | 2.1.0 |
| nuxt-svgo | 5.3.0 |
| Vue | 3.5.42 |
| Vue Router | 5.3.1 |
| Tailwind CSS | 4.3.3 |
| @tailwindcss/vite | 4.3.3 |
| @tailwindcss/typography | 0.5.20 |
| @nuxt/eslint | 1.17.0 |
| ESLint | 10.10.0 |
| TypeScript | 7.0.2 |
| vue-tsc | 3.3.11 |
| Zod | 4.6.5 |
| Node.js | 24.x |

Nuxt 4의 공식 최소 `package.json` 형태에 맞춰 Vue와 Vue Router도 현재 최신 호환 버전으로 직접 명시했습니다.

## 구조 변경

Nuxt 4 기본 디렉터리 구조에 맞춰 애플리케이션 코드를 `app/` 하위로 이동했습니다.

```text
app/
  app.vue
  assets/
  components/
  data/
  layouts/
  pages/
content/
public/
server/
content.config.ts
nuxt.config.ts
```

## Nuxt Content 3 마이그레이션

- 기존 `queryContent()` 방식 대신 `queryCollection()` 사용
- `content.config.ts`에 `articles`, `author` Collection 정의
- `date`, `draft`, `tags`, `slug` 등 custom frontmatter schema 정의
- 블로그 목록의 `draft/date` 조회를 위한 DB index 추가

## Tailwind CSS 4 마이그레이션

- 기존 Tailwind v3 config 제거
- `@tailwindcss/vite` 플러그인 사용
- CSS는 `@import "tailwindcss"` 방식으로 변경
- Typography plugin은 CSS `@plugin` 방식으로 등록
- class 기반 다크모드를 위한 custom variant 정의
- v4에서 제거/변경된 일부 기존 utility class 정리

## ESLint 마이그레이션

기존 개별 ESLint plugin/config 대신 Nuxt 공식 `@nuxt/eslint` flat config를 사용합니다.

```text
eslint.config.mjs
```

## GitHub Pages

GitHub Pages 배포 Workflow도 현재 구조에 맞춰 갱신했습니다.

- Node.js 24
- `actions/checkout@v7`
- `actions/setup-node@v7`
- `npm install`
- `nuxt build --preset github_pages`

## 제거한 기존/불필요 의존성

기존 프로젝트에서 직접 사용하지 않거나 최신 Nuxt 환경에서 불필요한 패키지는 제거했습니다.

- `@nuxtjs/tailwindcss` 대신 Tailwind v4 Vite plugin 사용
- `babel-eslint` 제거
- 사용하지 않는 `prismjs`, `prism-themes` 제거
- GitHub Actions 배포로 전환되어 `gh-pages` 제거
- 중복 ESLint 관련 개별 plugin/config 제거

## Lockfile

업그레이드 환경에서 npm registry 연결이 불가능하여 새 `package-lock.json`을 생성하지 못했습니다.

최초 로컬 실행 시 다음 명령을 수행하세요.

```bash
npm install
```

정상 설치 후 생성되는 `package-lock.json`을 Git에 함께 커밋하는 것을 권장합니다. 그 이후에는 GitHub Actions의 설치 명령을 `npm ci`로 변경해도 됩니다.
