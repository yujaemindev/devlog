# 소방지휘 React 데모

Experience → Prototype Development(`/experience/prototype-development`)에서 React 빌드 결과를 iframe으로 표시합니다.
Nuxt의 baseURL을 적용하므로 GitHub Pages의 `/devlog/` 경로에서도 사용할 수 있습니다.

## 데모 갱신

React 프로젝트의 의존성이 설치된 상태에서 devlog 폴더에서 실행합니다.

```powershell
npm run build:fire-demo
```

기본 소스 위치는 형제 폴더 `../fire-command-center-react`입니다. 다른 위치는 인자로 지정합니다.

```powershell
npm run build:fire-demo -- "C:/path/to/fire-command-center-react"
```

원본 프로젝트를 수정하지 않고 `public/demos/fire-command-center`에 정적 파일을 생성합니다.
이 폴더의 결과물도 함께 커밋하면 기존 Nuxt 배포 과정에 포함되므로 배포 서버에는 React 소스가 필요하지 않습니다.
상대 에셋 경로로 빌드하며, 기존 파일을 자동 삭제하지 않습니다.

영상과 이벤트는 프로토타입의 모의 데이터입니다. 지도 타일을 불러오려면 인터넷 연결이 필요합니다.
