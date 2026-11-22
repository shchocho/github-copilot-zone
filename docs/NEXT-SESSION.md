# 다음 세션 프롬프트 (2026-11-18 작성, 11-22 갱신)

아래 "붙여 넣을 프롬프트"를 이 저장소를 연 Claude Code 세션에 그대로 붙여 넣으세요. 다른 PC(노트북 등)에서는 먼저 클론(이미 있으면 git pull)하고 npm install 을 한 뒤 시작합니다.

## 2026-11-22 정리 결과

- 최신화: 노트북 작업(11-18 시나리오 9편 · 11-19 배포 중단 · 자체 아이콘)을 받아 옴. VS Code main aeda485(11-22, 1.148)로 문구를 다시 뽑아 그대로인 것 확인. 정식판 1.147(11-18)·changelog(11-18~22)에 체험 단추 변경 없음 → docs/UI-SOURCES.md.
- 리팩터링: 공용 버전에서 온 M365 화면 코드(Office · Teams · Cowork · Copilot Chat 앱 · 시안 모드)와 그 CSS · 로고 · 하늘 사진을 지움. src ts/tsx 6,489 → 약 2,900줄, reference.css 12,886 → 3,065줄.
- 화면: 대기 · 홈 · 목록을 같은 어두운 로비 톤으로(홈은 Copilot이 맡는 범위 순서 눈금, 목록은 넘기지 않고 2~3편 나란히). 재생 화면은 중립 바탕 + 영역 색. 셸에서 공식 로고 · "© Microsoft" 를 빼고 자체 아이콘 + "교육용 시뮬레이터" 표기. 결과 화면 조사(과/와) · 로고 반복 · 코드 가로 넘침 고침. 기준은 DESIGN.md.
- 확인: 10편 e2e(1600×900) 결과 화면까지 · 콘솔 오류 0, 6개 해상도 가로 넘침 0, 실제 키(Tab · Ctrl+→ · Ctrl+I) + reduced-motion, npm run build · build:local 통과.

## 붙여 넣을 프롬프트

```
이 저장소는 "GitHub Copilot 체험 존"이야 (원격 https://github.com/shchocho/github-copilot-zone, 브랜치 main).
VS Code 안의 GitHub Copilot 과 GitHub.com 의 코딩 에이전트 · 코드 리뷰를 실제 화면과 거의 똑같이 눌러 보는 교육용 시뮬레이터야.
먼저 CLAUDE.md(배포 안전 기준), DESIGN.md, docs/NEXT-SESSION.md, docs/UI-SOURCES.md, README.md 를 읽고 시작해.

지금 상태: 시나리오 10편(영역 4개) 완성, 2026-11-22 에 M365 잔재를 지우고 로비 · 재생 화면을 정리함. 공개 배포는 꺼 둠(수동 전용).

할 일 후보
1. 최신화 확인: VS Code 새 정식판 · GitHub changelog 로 체험 단추 · 문구가 바뀌었는지 보고 labels.ts · UI-SOURCES.md 갱신(아래 "문구 다시 뽑기").
2. UI-SOURCES.md 의 "아직 확인하지 못한 것"을 실제 VS Code · GitHub 화면 캡처로 확인해 고치기.
3. 다시 공개할 때: github.io 가 아닌 인증 있는 호스트(Azure Static Web Apps + Entra ID 등)로. CLAUDE.md 점검 명령부터.

규칙: 문구 · 단추 이름은 지어내지 말 것(근거 없으면 UI-SOURCES.md 에 적기). 셸에는 공식 로고 · 브랜드 색을 쓰지 않음. 푸시는 사용자가 말할 때만.
```

## 문구 다시 뽑기 (scripts/ui-labels)

```bash
mkdir -p scripts/ui-labels/ref && cd scripts/ui-labels/ref
git -c core.longpaths=true clone --depth 1 --filter=blob:none --sparse https://github.com/microsoft/vscode.git vscode
cd vscode && MSYS_NO_PATHCONV=1 git sparse-checkout set --no-cone '/src/vs/workbench/contrib/chat/' '/src/vs/workbench/contrib/inlineChat/' '/src/vs/editor/contrib/inlineCompletions/' '/src/vs/workbench/contrib/scm/' '/src/vs/workbench/contrib/terminalContrib/chatAgentTools/' '/src/vs/workbench/contrib/mcp/' '/package.json' && cd ..
curl -sL -o ko.main.i18n.json https://raw.githubusercontent.com/microsoft/vscode-loc/main/i18n/vscode-language-pack-ko/translations/main.i18n.json
cd .. && python -I labels.py ref/vscode ref/ko.main.i18n.json ref/labels.tsv
python -I t.py "Allow Once" "Keep" "Undo"
python -I grep_labels.py 'chat' '^(Keep|Undo|Allow)' 40
```
