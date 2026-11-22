# GitHub Copilot 체험 존

VS Code 안의 **GitHub Copilot**과 GitHub.com의 **Copilot 코딩 에이전트 · 코드 리뷰**를 실제 제품 화면과 거의 똑같이 눌러 보는 시연(체험) 사이트입니다.
공용 Copilot 체험 사이트([shchocho/2609](https://github.com/shchocho/2609))의 시나리오 플레이어 엔진을 가져와 VS Code · GitHub.com 화면을 더했습니다.

- 가상의 회사 **누리테크(주)** 설비 모니터링 팀과 저장소 `sensor-hub`(TypeScript · Express · vitest)를 배경으로 합니다.
- 회사 · 저장소 · 인물 · 이슈 번호는 모두 가상입니다. 화면 하단에도 그 안내가 나옵니다.
- VS Code 화면은 한국어 UI, GitHub.com 화면은 영어 UI입니다(GitHub 웹에는 한국어 화면이 없습니다). 화면 문구의 근거는 [docs/UI-SOURCES.md](docs/UI-SOURCES.md)에 있습니다.

## 화면 흐름

| 화면 | 주소 | 내용 |
|---|---|---|
| 대기 | `#/` | 회색 제안이 떴다 받아들여지는 편집기 미리보기와 "체험해보기". 아무 곳이나 누르면 홈으로 |
| 홈 | `#/start` | 기능 영역 4개 — 왼쪽부터 Copilot이 맡는 범위가 넓어지는 순서(코드 완성 → Chat → 에이전트 → 코딩 에이전트) |
| 시나리오 목록 | `#/t/<영역>` | 영역의 시나리오 2~3편을 한 화면에 — 지금 하는 방식과 Copilot과 함께하는 방식을 나란히 |
| 재생 | `#/t/<영역>/<시나리오>` | 상황 → 흐름 → 체험 → 결과 |

- **체험**: VS Code(또는 GitHub.com)와 똑같이 생긴 화면에서 안내 말풍선을 따라 실제 단추를 누릅니다. Tab · Ctrl+I · Ctrl+→ 는 키보드로도 누를 수 있습니다.
- 5분 동안 조작이 없으면 대기 화면으로 돌아갑니다. 창이 768×600보다 작으면 "더 큰 화면에서 접속해 주세요" 안내가 나옵니다.

## 시나리오 (10편)

| 영역 | 시나리오 | 화면 · 눌러 보는 것 |
|---|---|---|
| 코드 완성 | 주석으로 의도를 쓰면 함수가 회색 제안으로 | VS Code · 고스트 텍스트 Tab 수락, Ctrl+→ 단어 수락 |
| | 필드 이름을 바꾸면 다음 고칠 곳을 알려 주는 다음 편집 제안 | VS Code · NES 여백 화살표, Tab 이동 → Tab 수락 |
| Copilot Chat | 처음 보는 집계 코드를 Ask 에이전트에게 설명받기 | VS Code 채팅(Ask) · 파일 컨텍스트, 이어서 질문 |
| | Ctrl+I 인라인 채팅으로 그 자리에서 입력 검증 추가 | VS Code · 인라인 채팅 → 유지 |
| | 바뀐 내용을 읽고 커밋 메시지까지 만들어 커밋 | VS Code 소스 제어 · 커밋 메시지 생성 → 커밋 |
| 에이전트 | 센서 경보 API를 에이전트에 맡겨 테스트 통과까지 | VS Code 채팅(Agent) · 터미널 명령 허용, 실패 수정, Keep |
| | Plan 에이전트로 계획부터 세우고 승인한 뒤 구현 | VS Code 채팅(Plan) · Plan summary → Implement Plan |
| | 팀 규칙과 GitHub MCP 서버로 이슈를 읽고 처리까지 | VS Code 채팅(Agent) · copilot-instructions.md, MCP 도구 한 번 허용 |
| 코딩 에이전트 · 리뷰 | GitHub 이슈를 Copilot에 맡기면 PR을 만들어 리뷰를 요청 | GitHub.com · Assignees → Assign to Copilot → PR |
| | PR에 Copilot 코드 리뷰를 요청하고 제안을 바로 커밋 | GitHub.com · Reviewers Request → Commit suggestion → Merge |

## 로컬에서 확인하기

### 방법 1. 더블클릭으로 열기 (Node.js 설치 불필요)

아래 명령의 결과인 `dist-local/` 폴더를 통째로 복사해 `index.html` 을 더블클릭합니다. Edge나 Chrome을 권장하며, 인터넷 연결 없이도 동작합니다. F11 키로 전체 화면을 쓰면 부스 화면과 같은 비율로 보입니다.

```bash
npm run build:local
```

### 방법 2. 개발 서버로 열기 (Node.js 20 이상)

```bash
npm install
```

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다. 코드나 시나리오를 고치면 화면이 바로 바뀝니다.

## 배포

웹 배포용 빌드는 `npm run build`, 결과는 `dist/` 폴더입니다. 주소는 해시(`#/…`) 방식이고 경로가 모두 상대 경로라 하위 경로에 올려도 서버 설정 없이 동작합니다. Azure Static Web Apps를 쓸 때는 `staticwebapp.config.json` 이 그대로 적용됩니다(앱 위치 `/`, 출력 위치 `dist`).

### 공개 배포는 꺼 두었습니다 (2026-11-19부터)

- `shchocho.github.io` 전체가 Google 세이프 브라우징 · Microsoft SmartScreen에서 '사기성 사이트'로 판정돼, 비밀번호 잠금 GitHub Pages 배포를 내렸습니다. 마지막 배포본은 `archive/gh-pages-20261119` 브랜치에 있습니다.
- `.github/workflows/pages.yml` 은 이제 수동 실행만 됩니다(`main` 푸시로 배포되지 않음).
- 다시 공개하려면 [CLAUDE.md](CLAUDE.md)의 "배포 안전 기준"을 먼저 읽고, github.io 가 아닌 진짜 인증이 있는 호스트(Azure Static Web Apps + Entra ID, Cloudflare Access 등)로 올립니다.
- 행사 부스에서는 아래 "방법 1"(`build:local` 결과를 더블클릭)로 엽니다. 인터넷 연결이 필요 없습니다.

## 고쳐 쓰기

- **문구(체험 존 이름 · 대기 · 홈 · 아래 안내)**: `src/copy.ts`
- **기능 영역(이름 · 설명 · 색)**: `src/tracks.ts`
- **대기 · 홈 · 목록 화면**: `src/screens/Attract.tsx` · `Home.tsx` · `ScenarioList.tsx` + `src/styles/ghcp-shell.css`
- **VS Code 화면 문구**: `src/surfaces/vscode/labels.ts` — VS Code 소스와 공식 한국어 언어 팩에서 가져온 문구입니다. 새 문구는 지어내지 말고 `scripts/ui-labels/` 로 다시 뽑아 씁니다(방법: [docs/NEXT-SESSION.md](docs/NEXT-SESSION.md)의 "문구 다시 뽑기").
- **화면**: VS Code `src/surfaces/vscode/VsCode.tsx` + `src/styles/vscode.css`, GitHub.com `src/surfaces/github/GitHubWeb.tsx` + `src/styles/github.css`
- **상황 그림**: `src/play/sceneArtDev.ts` (`dev-tests` · `dev-issue` · `dev-review` · `dev-docs` · `dev-commit`)
- **시나리오**: `src/scenarios/<영역>/<id>.scenario.json`. 파일을 추가하면 목록에 자동으로 나타납니다. 본보기는 `src/scenarios/agent/agent-alerts-api.scenario.json` 입니다. 고친 뒤 검사를 돌리세요.

```bash
npm run check:scenarios
```

### 시나리오 JSON

- `agent`: `"vscode"`(VS Code) 또는 `"github"`(GitHub.com), `surface` 도 같은 값.
- `vscode`: VS Code 화면 설정 — `tree`(탐색기 파일), `chat`(채팅 보기를 열지), `agent`(Agent · Ask · Plan), `context`(채팅 입력란의 파일), `view: "scm"` 과 `scm`(소스 제어 보기 · 커밋 메시지), `edits`(채팅 입력란 위 변경 파일 목록과 Keep).
- `workbench.artifacts`: 화면에 놓일 것 — `kind: "code"`(편집기 파일), `"term"`(터미널), `"gh"`(GitHub 이슈 · PR 페이지).
  - 코드 줄(`code.lines`)은 `g`(회색 제안) · `ga`(수락 깃발), `nes`(다음 편집 제안 `from` → `to`), `diff`(`add` · `del`), `cursor` 를 가집니다. 파일의 `inline` 은 인라인 채팅 상자, `kept` 는 유지 깃발입니다.
  - GitHub 페이지(`gh`)는 `events`(코멘트 · 리뷰 · 커밋 · 이벤트, 리뷰 코멘트의 `severity` · `suggestion` · `act`), `dialog`(Assign to Copilot 창), `stateBy`(병합 등)를 가집니다.
- `messages`: 체험 화면에서 순서대로 재생됩니다.
  - `cue` 안내 말풍선. 다음이 `user` 면 그 글이 채팅 입력란에 채워집니다. `target` 을 주면 화면 안의 단추를 직접 누르게 합니다 — VS Code: `tab` · `ctrl-right` · `ctrl-i` · `inline-send` · `keep` · `commit-msg` · `commit`, GitHub: `assign` · `assign-go` · `review` · `merge` · 리뷰 코멘트의 `act.id`.
  - `tool` 작업 한 단계(`opens` 열기 · `writes` 한 줄씩 작성 · `sets` 깃발 켜기 · `quiet` 이면 화면만 바꾸고 줄을 남기지 않음).
  - `assistant` 답변(`**굵게**` · `` `코드` `` · ✅ 목록 · ``` 코드 블록).
  - `approve` 실행 전 확인 카드 — 기본은 터미널 명령, `kind: "mcp"` 는 MCP 도구, `kind: "plan"` 은 계획 검토(Plan summary).
- 줄 · 이벤트 · 메시지의 `only` / `not` 에 깃발 이름을 적으면 그 깃발이 켜졌을 때만 / 꺼졌을 때만 보입니다.
- `scene`(상황 화면, `headline` 의 `‹‹ ››` 는 강조), `overview`(흐름 카드), `recap` · `finish`(결과 화면 요약).

### 확인하기

```bash
npm run build
```

개발 서버를 띄운 채 모든 시나리오를 결과 화면까지 자동으로 진행합니다(Playwright 필요). 한 영역만: `npm run e2e:all -- <영역>`.

```bash
npm run e2e:all
```

- 환경 변수: `W` · `H`(창 크기, 기본 1600×900), `SNAP_EVERY=1`(단계마다 스크린샷), `PW_CHROME`(설치된 Chromium 판이 playwright 와 다를 때 실행 파일 경로).

## 문서

- [DESIGN.md](DESIGN.md): 디자인 기준(로비 · 재생 셸 토큰 · VS Code Dark Modern · GitHub Primer)
- [docs/UI-SOURCES.md](docs/UI-SOURCES.md): 화면 문구 · 모양의 근거와 아직 확인하지 못한 것
- [docs/NEXT-SESSION.md](docs/NEXT-SESSION.md): 다음 작업 프롬프트와 문구 다시 뽑기
- `docs/reference/`: 원본 부스 화면의 엔진 · 렌더링 명세(필요한 절만 찾아 읽기)

## 출처 · 라이선스

- 화면 문구: [microsoft/vscode](https://github.com/microsoft/vscode)(MIT) 소스의 문자열과 [microsoft/vscode-loc](https://github.com/microsoft/vscode-loc) 한국어 언어 팩, VS Code · GitHub 공식 문서. 자세한 근거는 docs/UI-SOURCES.md.
- 아이콘: [Codicons](https://github.com/microsoft/vscode-codicons) — © Microsoft Corporation, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (`@vscode/codicons`). 일부 아이콘은 Fluent UI System Icons(MIT).
- 글꼴: Pretendard(OFL).
- 셸(대기 · 홈 · 목록 · 탭 아이콘)에는 자체 아이콘(`public/favicon.svg`)과 "Copilot 체험 존 · 교육용 시뮬레이터" 이름을 씁니다. GitHub · VS Code 모양은 체험 단계의 제품 화면 안에만 있습니다(`public/logo/ghcp/`, Codicons). 외부에 공개할 때는 각 브랜드 사용 지침과 CLAUDE.md 의 배포 안전 기준을 확인하세요.
- 시나리오 플레이어 엔진은 공용 Copilot 체험 사이트(shchocho/2609)에서 가져왔고, 2026-11-22 에 이 체험 존이 쓰지 않는 Microsoft 365 화면 코드를 지웠습니다.
