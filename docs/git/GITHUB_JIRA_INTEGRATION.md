# GitHub · Jira 개발 이력 연동

## 연동 목적

- 로컬 개발은 `Yujaemin Local` MCP의 Git/Jira 도구를 사용한다.
- ChatGPT에서 GitHub 저장소·PR·CI를 직접 관리하려면 사용자가 별도로 GitHub 연결을 승인한다.
- **Jira 이슈의 개발(Development) 영역에 커밋·브랜치·PR을 표시하는 기능은 GitHub MCP가 아니라 Jira의 GitHub for Atlassian 연동이 담당한다.**

## 외부 서비스 최초 연결 (사용자 승인 필요)

1. Jira 관리자 권한으로 **Apps → Explore more apps**에서 `GitHub for Atlassian`을 설치한다.
2. 앱의 `Get started`에서 GitHub Cloud 연결을 시작한다.
3. 연결할 GitHub 소유 조직(또는 앱에서 허용하는 계정)을 선택하고 `yujaemindev/devlog` 저장소에 대한 접근만 승인한다.
4. Jira **Apps → Manage your apps**에서 연결된 계정과 저장소 접근 범위를 확인한다.
5. GitHub에 Push한 커밋의 키가 Jira 이슈의 개발 정보에 표시되는지 확인한다.

공식 안내: https://support.atlassian.com/jira-cloud-administration/docs/integrate-with-github/

주의: Atlassian 공식 설치 문서는 **GitHub 조직 연결**을 기준으로 안내한다. 개인 계정 소유 저장소가 연결 선택지에 나오지 않으면 지원 범위를 확인해야 한다. 조직 생성·저장소 이전 또는 타사 앱 설치를 임의로 수행하지 않는다.

## 신규 커밋 메시지 규칙

```text
DEVLOG-27 feat: AI 개발 워크플로 화면 개선
DEVLOG-22 docs: Jira 및 Git 운영 규칙 정리
DEVLOG-27 test: GitHub 연동 검증 추가
```

- 형식: `<Jira 이슈 키> <type>: <한글 요약>` (예: `DEVLOG-27 feat: ...`).
- 변경 목적에 맞는 **실제 Jira 이슈 키**를 사용한다. 커밋 전 `jira_get_issue`로 존재·요약·부모 관계를 확인한다.
- 변경 파일을 기능 단위로 나눈 다음 해당 기능의 이슈 키를 붙인다. 관련 이슈가 없으면 사용자에게 적절한 이슈 지정/생성을 요청한다.
- `git_commit`은 메시지 원문을 그대로 사용하므로 기존 도구로 이 형식을 적용할 수 있다.
- GitHub for Atlassian 연결이 끝난 후 Push한 새 커밋을 이슈 화면의 **개발(Development)** 영역에서 확인한다.
- 브랜치를 분리하는 경우 `DEVLOG-27-설명`처럼 이슈 키를 포함하고, PR 제목에도 키를 포함한다.
- 기존 커밋의 해시/메시지를 변경하는 재작성(rebase/amend/force push)은 별도 명시적 승인 없이는 금지한다.

## Smart Commit은 선택 기능

단순 이슈 키를 넣으면 개발 이력 연결에 사용된다. `#comment`, `#time`, 상태 전환 명령은 **추가로 Jira 데이터가 변경될 수 있으므로** 별도의 사용자 요청이 있을 때만 사용한다. 이 기능에는 Jira 측 설정과 GitHub·Jira 계정 이메일 일치 등 조건이 있을 수 있다.

공식 안내: https://support.atlassian.com/jira-software-cloud/docs/process-issues-with-smart-commits/

## 적용·검증 체크

1. `jira_get_issue({ issueKey: "DEVLOG-27" })`로 대상 확인.
2. `git_status`에서 수정 파일 확인 후 관련 파일만 `git_add`.
3. `git_commit({ message: "DEVLOG-27 feat: ..." })` 형태로 커밋.
4. 테스트와 diff를 검증한 뒤 **Push는 사용자가 명시적으로 요청한 경우에만 수행**.
5. Push 후 해당 Jira 이슈에서 개발 정보를 확인하고, 연결이 보이지 않으면 앱 권한·저장소 범위·인덱싱 상태 점검.

API 키·PAT·OAuth 토큰은 Git에 포함하지 않는다. ChatGPT의 GitHub 연결, Jira 앱 설치, GitHub 권한 승인 등의 외부 서비스 연결은 사용자가 직접 승인해야 한다.
