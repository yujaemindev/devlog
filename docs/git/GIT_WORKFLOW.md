# Git 작업 규칙

## 변경사항 확인
- 작업 전후 `git_status`로 기존 변경사항을 확인한다.
- 다른 작업의 미커밋 변경사항은 임의로 포함하거나 되돌리지 않는다.
- 커밋은 기능 또는 목적별로 묶고 변경 파일의 범위를 검토한다.

## 커밋과 Push
- 커밋 메시지는 핵심 변경사항을 한글로 요약하며, **관련 Jira 이슈가 있으면 `DEVLOG-27 feat: ...`처럼 실제 이슈 키를 맨 앞에 넣는다.**
- 커밋 전 `jira_get_issue`로 연결할 Jira 이슈 키의 존재와 작업 범위를 확인한다. 관련 이슈가 불명확하면 임의로 키를 정하지 않는다.
- GitHub 커밋을 Jira 개발 정보에 표시하려면 별도의 **GitHub for Atlassian 연동**이 필요하다. GitHub MCP 연결만으로 자동 표시되는 것은 아니다.
- Git push는 사용자가 명시적으로 요청한 경우에만 수행한다.
- 푸시 전 변경 범위와 검증 결과를 확인한다.

## 참고
- [GITHUB_JIRA_INTEGRATION.md](./GITHUB_JIRA_INTEGRATION.md): GitHub 연결, Jira 개발 정보 표시, 커밋 이슈 키 운영
- [LOCAL_MCP_INSTRUCTIONS.md](../LOCAL_MCP_INSTRUCTIONS.md)
