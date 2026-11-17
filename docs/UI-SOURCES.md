# 화면 문구 · 모양의 근거 (2026-11-17~18 조사)

체험 화면은 실제 제품 화면을 그대로 옮기는 것이 목표입니다. 문구를 지어내지 않고, 아래 근거에서 가져왔습니다.

## VS Code (한국어 UI)

- 소스: `microsoft/vscode` main, 버전 1.148.0 (커밋 38ab687, 2026-11-17)
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

## 제품 동작 (공식 문서, 2026-11-11 갱신본)

- 채팅 보기 · 하네스 · 에이전트(Ask/Agent/Plan) · 권한: https://code.visualstudio.com/docs/agents/run/chat-view , /agents/run/agent-harnesses , /agents/run/approvals
- 편집 검토 Keep/Undo · 검사점: https://code.visualstudio.com/docs/agents/run/review-code-edits
- 계획(/plan): https://code.visualstudio.com/docs/agents/run/planning
- 인라인 제안 · NES: https://code.visualstudio.com/docs/editing/ai-powered-suggestions
- 인라인 채팅: https://code.visualstudio.com/docs/chat/inline-chat
- 스마트 동작(커밋 메시지 등): https://code.visualstudio.com/docs/editing/copilot-smart-actions
- 사용자 지정(instructions · agents · skills · MCP): https://code.visualstudio.com/docs/agent-customization/
- 릴리스 노트 1.144(Universe)~1.146(2026-11-11): https://code.visualstudio.com/updates/v1_146

## GitHub.com (영어 UI — GitHub 웹은 한국어 화면이 없음)

- 이슈를 Copilot에 맡기기(Assignees > Copilot > "Assign to Copilot": Optional prompt · Repository · Base branch · Custom agent · Model): https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github
- Copilot 코드 리뷰(Reviewers > Copilot Request, 중요도 High/Medium/Low): https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review

## 아직 확인하지 못한 것 (실제 화면을 보면 고칠 것)

- 채팅 입력란의 기본 안내 글: 소스상 확장이 주는 값이라 확정 못 함. 지금은 "Copilot 님과 채팅"(chatWidget 의 번역)으로 둠.
- 도구 실행 줄 중 "읽기" 표현(`… 읽기`)은 근사치. 실제 Copilot 하네스 문구는 확인 필요.
- 승인 카드의 드롭다운 항목 배치, 작업 집합의 정확한 모양.
- Copilot 하네스에서 할 일 목록이 보이는 모양.
- 클라우드 에이전트 PR 의 제목 · 초안 여부(문서에 2026년 기준 설명 없음).
