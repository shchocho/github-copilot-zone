# DESIGN.md — GitHub Copilot 체험 존

이 사이트의 디자인 기준입니다. 화면은 두 층으로 나뉘고, 층마다 따르는 기준이 다릅니다.

| 층 | 무엇 | 기준 | 파일 |
|---|---|---|---|
| 부스 셸 | 대기 · 홈 · 목록 · 상황 · 흐름 · 결과 화면, 안내 말풍선 | 공용 체험 사이트(2609)의 부스 토큰 | `src/styles/reference.css`, `src/styles/ghcp-shell.css`, `src/styles/overrides.css` |
| 제품 화면 | 체험 단계의 VS Code · GitHub.com 창 | 실제 제품 모양이 우선 — VS Code **Dark Modern**, GitHub **Primer** 밝은 테마 | `src/styles/vscode.css`, `src/styles/github.css` |

## Project DNA

1. **제품 화면은 복제, 셸은 안내.** 제품 화면은 실제 VS Code · GitHub와 같은 배치 · 색 · 글자 크기 · 문구를 쓴다. 꾸미거나 "더 예쁘게" 바꾸지 않는다. 안내와 강조는 셸(말풍선 · 어둡게 덮기 · 단추 테두리)이 맡는다.
2. **문구는 근거가 있어야 한다.** 제품 화면의 단추 · 메뉴 이름은 VS Code 소스 + 한국어 언어 팩(`labels.ts`) 또는 공식 문서에서 가져온다. 근거가 없으면 `docs/UI-SOURCES.md` 의 "아직 확인하지 못한 것"에 적는다. 번역이 없는 최신 문구는 실제처럼 영어로 둔다.
3. **누를 곳은 실제 단추.** 체험자는 말풍선 단추가 아니라 화면 속 실제 자리(Keep · 수락 · Assign · Merge …)를 누른다. 키보드 단축키(Tab · Ctrl+I · Ctrl+→)도 실제로 동작한다.
4. **셸 텍스트는 한국어 존댓말, 짧게.** 한 말풍선에 한 가지 행동. 셸 문구에는 마크다운 기호를 쓰지 않는다(말풍선은 평문).
5. **가상의 세계.** 누리테크(주) · `sensor-hub` · 가상 인물/계정(`me`, `nuri-pm`)만 쓴다. 실존 인물 · 회사 금지.

## 부스 셸 토큰 (reference.css 그대로)

- 글꼴: Pretendard(한글), 숫자 · 영문도 같은 글꼴.
- 잉크: `--sc-ink` #1b1a19 · `--sc-ink-2` #605e5c · `--sc-ink-3` #8a8886. 바탕은 밝은 베이지/흰 카드, 결과 화면은 하늘색 그라데이션(`sc-stage-sky`).
- 영역 색: `src/tracks.ts` 의 `color` / `textColor` → CSS `--track-<id>` (코드 완성 #0969da · Chat #8250df · 에이전트 #1a7f37 · 코딩 에이전트 #bc4c00). 상황 그림의 강조색이 이 값을 따른다.
- 대기 화면만 GitHub 다크(#0d1117 바탕, #f0f6fc 글자, #4493f8 초점)로 둔다(`ghcp-shell.css`).
- 말풍선: 흰 카드 + 큰 모서리 + 그림자, 대상 영역만 밝게 뚫고 나머지를 어둡게 덮는다(`components/coach.tsx`).

## VS Code (Dark Modern) — `vscode.css`

- 색 토큰(`.vsc` 아래): 편집기 #1f1f1f · 사이드바/패널 #181818 · 테두리 #2b2b2b · 글자 #cccccc · 흐린 글자 #9d9d9d · 강조(단추) #0078d4 · 입력 #313131 · 수정 #e2c08d · 추가 #73c991 · 삭제 #f14c4c · 고스트 텍스트 #ffffff56.
- 글꼴: UI `Segoe WPC, Segoe UI`(+ 맑은 고딕 · Pretendard), 코드 `Consolas`(+ D2Coding · 맑은 고딕). 편집기 14px/19px, 채팅 13px, 상태 표시줄 12px.
- 배치: 제목 표시줄 → 작업 표시줄 · 기본 사이드바 · 편집기(탭 · 이동 경로 · 코드) · 패널(터미널) · 보조 사이드바(채팅) → 상태 표시줄. 채팅 폭 `clamp(340px, 27vw, 430px)`.
- 아이콘: Codicons 만 쓴다(`<i class="codicon codicon-…">`). 파일 아이콘은 Seti 테마를 닮게 글자로 그린다.
- 셸 스타일이 새어 들어오면(예: 답변 17px, 승인 단추 흰 바탕) `.vsc-chat …` / `.vsc-confirm …` 아래에서 VS Code 값으로 되돌린다.
- 예외(디자인 검사): 추가 · 삭제 줄 옆의 세로 막대는 VS Code diff 여백 장식을 그대로 옮긴 것이라 `side-tab` 규칙에서 뺐다(`.impeccable/config.json`).

## GitHub.com (Primer 밝은 테마) — `github.css`

- 색 토큰(`.gh` 아래): 글자 #1f2328 · 흐린 글자 #59636e · 테두리 #d1d9e0 · 바탕 #f6f8fa · 링크/강조 #0969da · 성공 #1a7f37 (단추 #1f883d) · 병합 #8250df · 위험 #cf222e.
- 배치: 위쪽 머리글(저장소 경로 · 검색 · 탭) → 제목 · 상태 배지 · 타임라인 + 오른쪽 사이드바(Reviewers · Assignees · Labels · Development) → 오른쪽 Copilot 패널.
- 아이콘: Octicons 대신 같은 모양의 Codicons.
- 문구는 영어(GitHub 웹에는 한국어 화면이 없음). Copilot이 쓴 PR 본문 · 리뷰 코멘트 내용은 한국어 저장소 맥락에 맞게 한국어로 둔다.

## 반응형 · 접근성

- 최소 768×600. 그보다 작으면 안내 화면을 띄운다. 확인 해상도: 1920 · 1600 · 1440 · 1371×768 · 1280 · 768.
- 눌러야 할 단추는 `button` + `data-act`, 키보드 단축키는 `labels.ts` 의 `KEY_TARGETS`.
- `prefers-reduced-motion` 이면 타이핑 · 이동 연출을 줄인다.
- 장식 아이콘은 `aria-hidden`, 단추에는 보이는 이름이나 `aria-label`.
