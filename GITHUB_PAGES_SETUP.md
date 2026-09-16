# GitHub Pages 배포 설정

대상 저장소: `https://github.com/yujaemindev/devlog`

## 적용된 설정

- Nuxt 4 + Node.js 24 환경
- Repository Pages 경로 `/devlog/` 적용
- `.github/workflows/deploy.yml` 기반 자동 배포
- `main` push 시 의존성 설치 → typecheck → GitHub Pages build → deploy
- `.output/public/.nojekyll` 생성
- GitHub Actions `checkout@v7`, `setup-node@v7` 사용

## GitHub에서 최초 1회 해야 할 일

1. 저장소 `Settings` → `Pages`
2. `Build and deployment`의 `Source`를 **GitHub Actions**로 선택
3. 이 소스를 `main` 브랜치에 push
4. `Actions` 탭에서 `Deploy Nuxt to GitHub Pages` 성공 여부 확인
5. `https://yujaemindev.github.io/devlog/` 접속

## 로컬 준비

Node.js 24 사용을 권장합니다.

```bash
nvm use
npm install
npm run typecheck
npm run generate:pages
```

처음 `npm install`을 수행하면 최신 의존성에 맞는 `package-lock.json`이 생성됩니다. 생성된 lockfile은 이후 재현 가능한 빌드를 위해 Git에 커밋하는 것을 권장합니다.

## Push 예시

```bash
git add .
git commit -m "Upgrade blog to Nuxt 4"
git push origin main
```
