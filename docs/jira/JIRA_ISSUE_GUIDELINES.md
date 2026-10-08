# DEVLOG Jira 이슈 및 라벨 운영 규칙

관련 Jira 이슈: DEVLOG-22.

## 이슈 구조

- DEVLOG-23 (`DEVLOG 바이프코딩`)을 공통 Epic으로 사용한다.
- 최상위 메뉴(Home, Projects, Workflow, Experience)는 Epic 아래 Task로 관리한다.
- 하위 메뉴 및 상세 페이지는 해당 Task의 Subtask로 관리한다.
- 메뉴별 중복 Epic은 만들지 않는다.

## 라벨 규칙

- 메뉴 Task: `area-{영역}`, `page-menu`.
- 하위 페이지 Subtask: 부모와 같은 `area-{영역}`, `page-{경로슬러그}`, 필요 시 기능·기술 라벨 1~3개.
- 문서화 및 운영 작업: `documentation`, `jira-management` 등 용도별 라벨.
- 상위 메뉴에 범용 `portfolio`, `workflow` 라벨을 추가하지 않는다. `area-workflow`는 사용 가능하다.
- 담당자, 상태, 우선순위는 Jira 기본 필드를 사용하며 라벨로 중복하지 않는다.

## 운영 절차

1. JQL로 중복 이슈 여부 확인.
2. 유형, 부모 이슈, 라벨 결정 후 생성·수정.
3. 생성 이후 부모·자식 관계와 라벨을 다시 조회해 검증.
4. 삭제 전 하위 이슈를 반드시 조회하고, 하위 이슈가 존재하면 삭제하지 않는다.
5. 메뉴 및 운영 정책이 변경되면 이 문서를 함께 갱신한다.

## 참고

- [LOCAL_MCP_INSTRUCTIONS.md](../LOCAL_MCP_INSTRUCTIONS.md): MCP 설정·도구·보안 지침.
- DEVLOG-22: Jira 이슈 구조 및 라벨 운영 규칙 정리.
