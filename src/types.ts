/** 시나리오 JSON 스키마 (src/scenarios/<track>/<id>.scenario.json) */

/** 체험 화면: VS Code(편집기 · 채팅 · 터미널) 또는 GitHub.com(이슈 · PR · Copilot 패널) */
export type AgentKind = 'vscode' | 'github';

/** only: 고른 선택지 id 나 켜진 깃발 중 하나라도 있을 때만 / not: 하나라도 있으면 숨김 */
export interface Filterable { only?: string[]; not?: string[] }

export interface ScenePoint { icon?: string; scene: string; say: string }
export interface Scene {
  eyebrow?: string;
  art?: string;
  artSlots?: Record<string, string>;
  headline: string;
  sub?: string;
  points: ScenePoint[];
}
export interface OverviewStep { icon?: string; title: string; desc: string }
export interface RecapItem { icon?: string; name: string; desc: string }
export interface FinishOut { app: string; name: string; note?: string }
export interface Finish { sub?: string; outs?: FinishOut[]; outsBy?: Record<string, FinishOut[]> }

/* ---------- VS Code (GitHub Copilot) ---------- */
/**
 * 편집기의 한 줄. 문구는 깃발(tool 메시지의 sets)과 only/not 으로 단계마다 바뀐다.
 * g: 커서 뒤의 회색 제안(고스트 텍스트). ga 깃발이 켜지면 일반 코드로 바뀐다(Tab 으로 수락한 상태)
 * diff: 에이전트 · 인라인 채팅이 고친 줄. 파일의 kept 깃발이 켜지면(유지) 표시가 사라지고, del 줄은 없어진다
 * nes: 다음 편집 제안 — from 을 to 로 바꾸자는 제안. flag 가 켜지면 바뀐 줄이 된다
 */
export interface CodeLine extends Filterable {
  t: string;
  g?: string;
  ga?: string;
  diff?: 'add' | 'del';
  nes?: { from: string; to: string; flag: string };
  /** 커서가 있는 줄 */
  cursor?: boolean;
}
/** 인라인 채팅(Ctrl+I) 상자: on 깃발이 켜지면 at 번째 줄 위에 열리고, done 깃발이 켜지면 닫힌다 */
export interface InlineChat { at: number; text: string; on: string; done?: string }
export interface CodeFile {
  path: string;
  lines: CodeLine[];
  inline?: InlineChat;
  /** 이 깃발이 켜지면 고친 줄(diff)을 받아들인 상태 */
  kept?: string;
  /** 탐색기 · 탭의 수정 표시(M · A)를 켜는 깃발 */
  touched?: string;
  added?: boolean;
}
export interface TermLine extends Filterable { t: string; tone?: 'cmd' | 'ok' | 'err' | 'dim' | 'warn' }
/** VS Code 화면 설정 (시나리오의 vscode) */
export interface VsCodeSetup {
  repo: string;
  branch: string;
  /** 탐색기에 보일 파일 경로 (폴더는 경로에서 만든다) */
  tree: string[];
  /** 오른쪽 채팅 보기를 열어 둘지 (코드 완성 · 인라인 채팅 시나리오는 닫아 둠) */
  chat?: boolean;
  /** 채팅 입력란의 에이전트 선택 (Agent · Ask · Plan) */
  agent?: string;
  /** 왼쪽 보기: 탐색기 또는 소스 제어 */
  view?: 'explorer' | 'scm';
  /** 채팅 입력란 위 작업 집합(변경된 파일). on 이 켜지면 보이고 kept 가 켜지면 사라진다 */
  edits?: { files: string[]; on: string; kept: string; added?: number; removed?: number };
  /** 소스 제어 보기: 변경 파일 · 커밋 메시지(msg, on 깃발이 켜지면 채워짐) · 커밋(done 깃발) */
  scm?: { changes: { path: string; st: 'M' | 'A' | 'D' }[]; msg: string; on: string; done?: string };
  /** 채팅 입력란에 붙어 있는 컨텍스트(파일 이름) */
  context?: string[];
}
/* ---------- GitHub.com ---------- */
export interface GhEvent extends Filterable {
  kind: 'comment' | 'event' | 'commit' | 'review' | 'pr-link' | 'check';
  who: string;
  /** 'copilot' 이면 Copilot 아이콘 */
  bot?: boolean;
  text: string;
  at?: string;
  body?: string[];
  /** 리뷰 코멘트: 파일 · 줄 · 중요도 · 제안 코드 */
  file?: string;
  line?: string;
  severity?: 'High' | 'Medium' | 'Low';
  suggestion?: { del: string[]; add: string[] };
  /** 리뷰 코멘트 아래 단추 (cue.target 과 같은 id 면 누를 수 있다) */
  act?: { id: string; label: string };
}
export interface GhPage {
  type: 'issue' | 'pr';
  repo: string;
  number: number;
  title: string;
  state: 'open' | 'merged' | 'draft';
  /** state 를 바꾸는 깃발 → 새 상태 */
  stateBy?: Record<string, 'open' | 'merged' | 'draft'>;
  author: string;
  body: string[];
  head?: string;
  base?: string;
  assignees?: { who: string; bot?: boolean; only?: string[]; not?: string[] }[];
  reviewers?: { who: string; bot?: boolean; state?: string; only?: string[]; not?: string[] }[];
  labels?: string[];
  events: GhEvent[];
  /** 오른쪽 사이드바의 누를 수 있는 곳: assign(담당자 지정) · review(리뷰 요청) */
  checks?: { name: string; state: 'ok' | 'fail' | 'run'; only?: string[]; not?: string[] }[];
  files?: number;
  /** "Assign to Copilot" 창: on 깃발이 켜지면 열리고 done 깃발이 켜지면 닫힌다 */
  dialog?: { on: string; done: string; prompt: string; base?: string; agent?: string; model?: string };
  /** 오른쪽 Copilot 패널 제목 (세션 로그) */
  panel?: string;
}

/* ---------- 작업 영역 결과물 ---------- */
export interface Artifact {
  app: string;
  kind: 'code' | 'term' | 'gh';
  code?: CodeFile;
  term?: { title?: string; lines: TermLine[] };
  gh?: GhPage;
  origin: 'read' | 'made';
  name: string;
  nameBy?: Record<string, string>;
  where: string;
  note?: string;
}
export interface Workbench { task: string; artifacts: Record<string, Artifact> }

/* ---------- 메시지 ---------- */
export interface ApproveRow { label: string; value: string }
export interface ChoiceOption {
  id: string;
  label: string;
  desc?: string;
  meta?: string;
  value?: string;
  say?: string;
}

/** target: 말풍선 버튼 대신 화면에서 직접 누를 단추의 id (data-act) */
export interface MsgCue extends Filterable { role: 'cue'; text: string; action: string; target?: string }
export interface MsgUser extends Filterable { role: 'user'; text: string }
export interface MsgAssistant extends Filterable { role: 'assistant'; text: string }
export interface MsgTool extends Filterable {
  role: 'tool'; tool: string; delayMs?: number;
  /** 이 결과물을 연다(편집기 탭 · 터미널 · GitHub 페이지) */
  opens?: string;
  /** 이 결과물을 연 뒤 한 줄씩 써 내려간다 */
  writes?: string;
  /** 이 도구가 끝나면 켜지는 깃발. 선택지 id 처럼 only/not 에 쓸 수 있다 (단계마다 화면 상태가 바뀌는 연출) */
  sets?: string;
  /** 화면 상태만 바꾸고 대화(세션 로그)에는 줄을 남기지 않는다 */
  quiet?: boolean;
}
/** 실행 전 확인 카드 (VS Code 채팅의 VsConfirm) */
export interface MsgApprove extends Filterable {
  role: 'approve';
  what: string;
  kind?: string;
  line?: string;
  rows?: ApproveRow[];
  warn?: string;
  go?: string;
  denied?: string;
  /** VS Code 확인 카드의 둘째 줄 (MCP 도구: '{서버}(MCP 서버)') */
  sub?: string;
}
/** 선택지 말풍선. builds: 고르면 이 결과물을 쓰기 시작한다 */
export interface MsgChoice extends Filterable {
  role: 'choice'; key: string; text: string; options: ChoiceOption[]; builds?: string;
}
export type Message = MsgCue | MsgUser | MsgAssistant | MsgTool | MsgApprove | MsgChoice;

export interface Scenario {
  _note?: string;
  id: string;
  track: string;
  order?: number;
  agent: AgentKind;
  surface?: string;
  model: string;
  title: string;
  summary: string;
  before?: string;
  hook?: string;
  startedAt?: string;
  anonymized?: boolean;
  scene?: Scene;
  overview?: OverviewStep[];
  workbench?: Workbench;
  /** agent 'vscode' 의 화면 설정 */
  vscode?: VsCodeSetup;
  messages: Message[];
  recap?: RecapItem[];
  finish?: Finish;
}

export interface TrackIntro { tone: string; icon?: string; caption: string }
export interface Track {
  id: string;
  name: string;
  icon: string;
  color: string;
  textColor: string;
  about: string;
  /** 'product' 면 홈의 "제품 기능 체험" 묶음에 놓인다 */
  group?: 'product';
  /** 목록의 제품별 보기에 세울 열 (vscode · github) */
  products?: string[];
  intro?: TrackIntro[];
}

/** 체험 중 상태: 고른 선택지 · 켜진 깃발 · 연 결과물 · 쓰는 중인 결과물과 줄 수 */
export interface PlayState {
  picks: { key: string; option: ChoiceOption }[];
  flags: string[];
  opened: string[];
  writing: string | null;
  rows: number;
}
export const INITIAL_STATE: PlayState = { picks: [], flags: [], opened: [], writing: null, rows: 0 };

export interface Vars { model: string; picks: Record<string, string>; vals: Record<string, string> }
