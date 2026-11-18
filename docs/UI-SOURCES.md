# 화면 문구 · 모양의 근거 (2026-11-17~18 조사, 11-18 재확인)

체험 화면은 실제 제품 화면을 그대로 옮기는 것이 목표입니다. 문구를 지어내지 않고, 아래 근거에서 가져왔습니다.

## VS Code (한국어 UI)

- 소스: `microsoft/vscode` main, 버전 1.148.0 (커밋 38ab687, 2026-11-17 → 11-18 커밋 3b381b1 로 다시 뽑아 labels.ts 의 Copilot 관련 문구가 모두 그대로인 것을 확인)
  - 다시 뽑을 때 `src/vs/workbench/contrib/mcp/**` 도 함께 받는다(MCP 도구 확인 문구)
  - `src/vs/workbench/contrib/chat/**`, `inlineChat/**`, `scm/**`, `terminalContrib/chatAgentTools/**`, `src/vs/editor/contrib/inlineCompletions/**`
- 번역: `microsoft/vscode-loc` main — `vscode-language-pack-ko/translations/main.i18n.json`, `extensions/vscode.git.i18n.json`
- 방법: 소스의 `localize('key', "English")` 를 모아 같은 모듈 · 키의 한국어 번역과 짝지었습니다. 언어 팩에 번역이 없는 문자열은 실제 한국어 VS Code 에서도 영어로 보이므로 영어 그대로 둡니다.
- 결과는 `src/surfaces/vscode/labels.ts` 에 모듈 이름과 함께 적었습니다.

| 화면 | 문구 | 근거 |
|---|---|---|
| 터미널 명령 확인 | '{명령}' 명령을 실행하시겠습니까? · 허용 · 건너뛰기 | runInTerminalTool |
| 도구 승인(일반) | 한 번 허용 · 항상 허용 | chatToolConfirmationSubPart · agentHostPermissionUiContribution |
| 도구 진행 | {0} 실행됨 · {0} 실행 중 · {0} 편집됨 · 작업 중... | chatTerminalToolProgressPart · chatThinkingContentPart · agentSessionsViewer |
| 작업 집합 | N files changed · Keep · Undo (번역 없음 → 영어) | chatSessionWorkingSet |
| 편집기 위 검토 막대 | 유지 · 실행 취소 · 1개 파일의 변경 내용 N개 | chatEditingEditorActions · chatEditingEditorOverlay |
| 인라인 제안 | 수락 · 단어 수락 · 이전 · 다음 · 이동 / 수락(NES) | inlineCompletions/commands · gutterIndicatorMenu |
| 채팅 입력 | 컨텍스트 추가... · 보내기 · Copilot / Agent / Auto / Manual permissions | chatContextActions · chatExecuteActions · 문서(아래) |
| 소스 제어 | 커밋 메시지 생성 · 커밋 · 변경 내용 · 메시지({0}(으)로 "{1}"에 커밋) | scmInput · git 확장 |
| 도구 실행 줄(읽기) | Read {0} (번역 없음 → 영어) | chatToolGroupSummary 'toolSummary.readFile' |
| MCP 도구 | {0} 실행(확인 제목 'Run {0}' · 실행 후 'Ran {0}') · {0}(MCP 서버) · 입력 · 한 번 허용 · 건너뛰기 · 경고 'MCP 서버 또는 악의적인 대화 콘텐츠가 …' | mcpLanguageModelToolContribution · chatToolConfirmationSubPart. 읽기 전용 도구(readOnlyHint)는 확인 없이 실행 |
| 계획 검토 카드 | Plan summary · Open Full Plan · Submit Feedback (번역 없음) · 거부 | chatPlanReviewPart · reviewPlanTool |
| 계획 승인 동작 | Implement Plan · Approve Plan Only (에이전트가 넘기는 동작 이름이라 소스에 고정 문자열 없음) | 문서 /agents/run/planning (2026-11-11) |

## 제품 동작 (공식 문서, 2026-11-11 갱신본)

- 채팅 보기 · 하네스 · 에이전트(Ask/Agent/Plan) · 권한: https://code.visualstudio.com/docs/agents/run/chat-view , /agents/run/agent-harnesses , /agents/run/approvals
- 편집 검토 Keep/Undo · 검사점: https://code.visualstudio.com/docs/agents/run/review-code-edits
- 계획(/plan): https://code.visualstudio.com/docs/agents/run/planning
- 인라인 제안 · NES: https://code.visualstudio.com/docs/editing/ai-powered-suggestions
- 인라인 채팅: https://code.visualstudio.com/docs/chat/inline-chat
- 스마트 동작(커밋 메시지 등): https://code.visualstudio.com/docs/editing/copilot-smart-actions
- 사용자 지정(instructions · agents · skills · MCP): https://code.visualstudio.com/docs/agent-customization/
- 릴리스 노트 1.144(Universe)~1.146(2026-11-11): https://code.visualstudio.com/updates/v1_146 — 11-18 기준 최신 정식판은 1.146(Insiders 1.147). 1.146 노트에 Ask · Plan 에이전트 이름이나 채팅 단추 이름 변경은 없음
- 사용자 지정 문서 주소가 바뀜: /docs/agent-customization/ 개요는 404, 하위 문서는 그대로 — https://code.visualstudio.com/docs/agent-customization/mcp-servers , /custom-instructions (MCP 서버 추가: Chat: Open Customizations > MCP Servers > Add Server)

## GitHub.com (영어 UI — GitHub 웹은 한국어 화면이 없음)

- 이슈를 Copilot에 맡기기(Assignees > Copilot > "Assign to Copilot": Optional prompt · Repository · Base branch · Custom agent · Model): https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github
- Copilot 코드 리뷰(Reviewers > Copilot Request, 중요도 High/Medium/Low, 기본은 Comment 리뷰 — Approve/Request changes 아님): https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review
- 제안 반영 단추 Commit suggestion · Add suggestion to batch · Commit changes: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request
- GitHub MCP 서버(원격 https://api.githubcopilot.com/mcp/ , 이슈 읽기 도구 `issue_read`): https://github.com/github/github-mcp-server
- Ignite 2026(11-17) 관련 변경 확인: MAI Code 2 모델 추가, Copilot 코드 리뷰 adaptive effort · 비밀 값 탐지(미리 보기), 리뷰 overview 코멘트 간소화(11-06). 체험에서 누르는 단추 이름이 바뀐 발표는 찾지 못함
  - https://github.blog/changelog/2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more/
  - https://github.blog/changelog/2026-11-06-copilot-code-review-api-management-and-review-overview-updates/
  - https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/

## 아직 확인하지 못한 것 (실제 화면을 보면 고칠 것)

- 채팅 입력란의 기본 안내 글: 소스상 확장이 주는 값이라 확정 못 함. 지금은 "Copilot 님과 채팅"(chatWidget 의 번역)으로 둠.
- ~~도구 실행 줄 "읽기"~~ → 소스의 'Read {0}'(번역 없음)으로 바꿈. 다만 Copilot 하네스가 이 요약 문구를 그대로 쓰는지는 실제 화면으로 확인 필요.
- 승인 카드의 드롭다운 항목 배치, 작업 집합의 정확한 모양.
- Copilot 하네스에서 할 일 목록이 보이는 모양.
- 클라우드 에이전트 PR 의 제목 · 초안 여부 · 브랜치 이름(`copilot/…` 로 둠) — 문서에 설명 없음. 체험에서는 작업이 끝난 뒤의 Open PR 로 둠.
- 이슈를 Copilot에 배정한 뒤 이슈 타임라인에 남는 기록(👀 반응 · "started work" 등) — 문서에 설명 없음. 지금은 "assigned Copilot" · "linked a pull request that will close this issue" 만 둠.
- GitHub 오른쪽 Copilot 패널의 세션 로그 줄 모양: 체험에서는 VS Code 하네스 문구(Read · Edited · Ran {0})로 근사함. 문서에는 "세션 로그를 연다"고만 있음.
- Copilot 리뷰 코멘트 머리의 표시(`bot` 배지 대신 실제로는 다른 표시일 수 있음)와 overview 코멘트 제목("Pull request overview") — 11-06 변경으로 더 짧아졌다고 함.
- GitHub MCP 의 댓글 도구 이름 `add_issue_comment` — README 도구 목록을 끝까지 읽지 못해 확정 못 함.
- MCP 확인 카드의 도구 설명 줄(tool.definition.description)은 서버가 주는 값이라 비워 둠.
- 채팅 입력란의 에이전트 목록에 Ask 가 Copilot 하네스에서도 그대로 보이는지(문서 chat-view 에는 Ask/Agent/Plan, 소스에는 이름이 확장 쪽에 있음).
- Plan 승인 후 에이전트 선택이 Agent 로 바뀌는지 — 지금은 Plan 그대로 둠.
- 커밋 메시지 생성 결과의 언어(영어로 둠 — 팀 지침 · 설정에 따라 달라질 수 있음).
