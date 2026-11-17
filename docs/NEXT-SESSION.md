# 다음 세션 프롬프트 (2026-11-18 작성)

아래 "붙여 넣을 프롬프트"를 `D:\github-copilot-zone` 에서 연 Claude Code 세션에 그대로 붙여 넣으세요.

## 붙여 넣을 프롬프트

```
D:\github-copilot-zone 는 "GitHub Copilot 체험 존" 프로젝트야 (원격: https://github.com/shchocho/github-copilot-zone, 브랜치 main).
공용 Copilot 체험 사이트(shchocho/2609, 브랜치 claude/busy-wright-7wa9ee)의 시나리오 플레이어 엔진을 복사해서,
VS Code 안의 GitHub Copilot 을 실제 UI와 거의 똑같이 눌러 보는 시연 사이트를 만드는 중이야.
먼저 docs/NEXT-SESSION.md(이 파일), docs/UI-SOURCES.md, README.md 를 읽고 시작해.

결정된 것
- 화면 언어: VS Code 는 한국어 UI. 문구는 VS Code 소스 + 공식 한국어 언어 팩에서 가져오고(src/surfaces/vscode/labels.ts),
  언어 팩에 번역이 없는 최신 문구는 실제처럼 영어로 둔다. GitHub.com 화면은 영어 UI(한국어 화면이 없음).
- 영역 4개 · 시나리오 영역당 2~3편: 코드 완성(completions) · Copilot Chat(chat) · 에이전트(agent) · 코딩 에이전트·리뷰(cloud)
- 가상 회사 누리테크(주) 설비 모니터링 팀, 저장소 sensor-hub(TypeScript · Express · vitest). 실존 인물·회사 금지.
- 디자인 절차는 universal-design-intelligence 스킬(Discovery → DNA → Build → Verify → Report). 제품 화면은 실제 제품 모양이 우선.

어제까지 된 것 (빌드 · 시나리오 검사 통과, 브라우저 확인은 아직 안 함)
- 엔진: agent 'vscode' · 'github' 추가(src/types.ts 의 CodeLine · CodeFile · VsCodeSetup · GhPage),
  Play.tsx 에 두 화면 연결, 키보드 단축키 단추(Tab · Ctrl+I · Ctrl+→ — labels.ts 의 KEY_TARGETS).
- VS Code 화면: src/surfaces/vscode/VsCode.tsx + src/styles/vscode.css (제목 표시줄 · 작업 표시줄 · 탐색기/소스 제어 · 탭 · 코드 강조 ·
  고스트 텍스트 · 다음 편집 제안 · 인라인 채팅 · 채팅 편집 diff · 터미널 · 채팅 보기 · 작업 집합 Keep/Undo · 명령 실행 확인 카드 · 상태 표시줄)
- GitHub 화면: src/surfaces/github/GitHubWeb.tsx + src/styles/github.css (이슈/PR · Assign to Copilot 창 · 리뷰 코멘트 · 병합 상자 · 오른쪽 Copilot 세션 로그)
- 부스 셸: 대기 화면(Attract.tsx — 실제 편집기 모양 미리보기), 홈 로고, 트랙 4개(src/tracks.ts), 문구(src/copy.ts), 상황 그림(src/play/sceneArtDev.ts: dev-tests · dev-issue · dev-review · dev-docs · dev-commit)
- 시나리오 1편: src/scenarios/agent/agent-alerts-api.scenario.json (본보기 — 다른 시나리오는 이 형식을 따른다)

오늘 할 일 (순서대로, 단계마다 커밋)
1. 브라우저 확인부터: npm run dev 로 띄우고 agent-alerts-api 를 처음부터 결과 화면까지 진행해 본다
   (Playwright MCP 또는 내장 브라우저. 내장 브라우저 창이 숨겨져 있으면 타이머가 느려져 멈추니 Playwright MCP 권장).
   1600×900, 1371×768 스크린샷으로 VS Code 화면 배치·글자 넘침·겹침을 고친다. 콘솔 오류 0.
2. 남은 시나리오 9편 작성 (본보기 형식, npm run check:scenarios 통과, 하나씩 끝까지 재생 확인)
   - completions/complete-ghost: 주석으로 의도를 쓰면 함수가 회색 제안으로 → Tab 수락(target 'tab'), 다음 제안은 단어 수락(Ctrl+→)
   - completions/complete-nes: 필드 이름을 바꾸면 다음 편집 제안(NES)이 같은 파일의 나머지 사용처를 제안 → Tab 이동 → Tab 수락 (CodeLine.nes)
   - chat/chat-explain: Ask 에이전트(vscode.agent "Ask")로 처음 보는 집계 코드 설명 받기 (#file 컨텍스트, 답변에 코드 블록)
   - chat/inline-chat: Ctrl+I 인라인 채팅(target 'ctrl-i' → CodeFile.inline → 'inline-send' → diff → 'keep')으로 입력 검증 추가. 채팅 보기는 닫음(vscode.chat false)
   - chat/commit-message: 소스 제어 보기(vscode.view 'scm', vscode.scm)에서 ✨ 커밋 메시지 생성(target 'commit-msg') → 커밋(target 'commit')
   - agent/agent-plan: Plan 에이전트로 /plan → 계획 카드(Implement Plan · Approve Plan Only · Reject — 필요하면 choice 로) → 구현
   - agent/agent-mcp: .github/copilot-instructions.md 팀 규칙 + GitHub MCP 서버(사용자 지정 > MCP Servers)로 이슈 #151 내용을 읽어 작업
   - cloud/cloud-assign-issue: GitHub 이슈 → Assignees 의 Copilot(target 'assign') → Assign to Copilot 창(GhPage.dialog, 'assign-go') →
     오른쪽 세션 로그에 진행 → PR 페이지 열림(opens) → 리뷰 요청
   - cloud/cloud-code-review: PR 에서 Reviewers 의 Copilot Request(target 'review') → 중요도 달린 리뷰 코멘트 + Suggested change → 코멘트 단추(GhEvent.act) → 병합(target 'merge')
3. 셸 마무리: README.md 를 이 프로젝트 기준으로 새로 쓰기(시나리오 표 · 고쳐 쓰기 안내 · 출처 · codicons CC-BY-4.0 표기),
   package.json name 을 github-copilot-zone 으로, DESIGN.md(Project DNA: 셸은 부스 토큰, 제품 화면은 VS Code Dark Modern · GitHub Primer) 작성.
   필요 없는 M365 화면 코드(Office · Teams · Studio · Flow · Cowork)는 시나리오가 다 끝난 뒤 지울지 판단(지금은 남겨 둠).
4. 품질 게이트: 시나리오 10편 전부 결과 화면까지(e2e), 1920 · 1440 · 1280 · 768(최소 768×600) 해상도, 키보드(Tab · Ctrl+I 실제 키),
   reduced-motion, npm run build · npm run build:local. 실행한 것 / 못 한 것 / 남은 것을 나눠 보고.
5. 배포: .github/workflows/pages.yml 은 main 푸시 때 돈다. 저장소 Settings > Secrets and variables > Actions > Repository secrets 에
   PAGE_PASSWORD 가 있어야 올라간다(없으면 건너뜀). 사용자가 넣었는지 Actions 실행 단계로 확인.
6. Microsoft Ignite 2026(11-17~20)와 VS Code 다음 릴리스(주간)로 Copilot 화면 문구가 바뀌었는지 확인하고 labels.ts · UI-SOURCES.md 갱신.
   문구 재추출: scripts/ui-labels/ 의 스크립트(아래 "문구 다시 뽑기").

규칙: 문구·버튼 이름은 지어내지 말 것(근거 없으면 UI-SOURCES.md 의 "확인 못 한 것"에 적기). 푸시는 main 에.
```

## 문구 다시 뽑기 (scripts/ui-labels)

```bash
mkdir -p scripts/ui-labels/ref && cd scripts/ui-labels/ref
git -c core.longpaths=true clone --depth 1 --filter=blob:none --sparse https://github.com/microsoft/vscode.git vscode
cd vscode && MSYS_NO_PATHCONV=1 git sparse-checkout set --no-cone '/src/vs/workbench/contrib/chat/' '/src/vs/workbench/contrib/inlineChat/' '/src/vs/editor/contrib/inlineCompletions/' '/src/vs/workbench/contrib/scm/' '/src/vs/workbench/contrib/terminalContrib/chatAgentTools/' '/package.json' && cd ..
curl -sL -o ko.main.i18n.json https://raw.githubusercontent.com/microsoft/vscode-loc/main/i18n/vscode-language-pack-ko/translations/main.i18n.json
cd .. && python -I labels.py ref/vscode ref/ko.main.i18n.json ref/labels.tsv
python -I t.py "Allow Once" "Keep" "Undo"
python -I grep_labels.py 'chat' '^(Keep|Undo|Allow)' 40
```

## 2609(공용 버전) 쪽 남은 일

- 웹 사이트(https://shchocho.github.io/2609/)는 아직 11-15 빌드. 2609 저장소에 PAGE_PASSWORD 저장소 비밀 값을 넣고 Actions 의 마지막 "GitHub Pages 배포"를 Re-run.
