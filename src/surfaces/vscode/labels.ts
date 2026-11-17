/**
 * VS Code 한국어 화면 문구.
 * 출처: microsoft/vscode main(1.148, 2026-11-17) 소스의 localize 문자열 + microsoft/vscode-loc 한국어 언어 팩(main.i18n.json).
 * 언어 팩에 번역이 없는 문자열은 실제 한국어 VS Code 에서도 영어로 보이므로 영어 그대로 둔다(표시: // 번역 없음).
 * 모듈 이름은 vs/workbench/contrib/... 아래 파일 이름이다. 조사 기록: docs/UI-SOURCES.md
 */
export const L = {
  /* 창 · 워크벤치 */
  menu: ['파일(F)', '편집(E)', '선택 영역(S)', '보기(V)', '이동(G)', '실행(R)', '터미널(T)', '도움말(H)'],
  explorer: '탐색기',
  scm: '소스 제어',
  search: '검색',
  run: '실행 및 디버그',
  extensions: '확장',
  outline: '개요',
  timeline: '타임라인',
  panelTabs: ['문제', '출력', '디버그 콘솔', '터미널', '포트'],
  terminal: '터미널',
  lnCol: (ln: number, col: number) => `줄 ${ln}, 열 ${col}`,
  spaces: '공백: 2',

  /* 채팅 보기 (chatWidget · chatExecuteActions · chatContextActions) */
  chat: '채팅',
  placeholder: (name: string) => `${name} 님과 채팅`, // chatWidget 'chat.input.placeholder.lockedToAgent'
  addContext: '컨텍스트 추가...', // chatContextActions
  send: '보내기', // chatExecuteActions
  working: '작업 중...', // agentSessionsViewer 'Working...'
  sessionTarget: 'Copilot', // agentSessions
  model: 'Auto', // 모델 선택의 기본값(이름이라 번역하지 않음)
  permissions: 'Manual permissions', // 번역 없음

  /* 도구 실행 · 승인 (runInTerminalTool · chatToolConfirmationSubPart) */
  ran: (cmd: string) => `${cmd} 실행됨`, // chatTerminalToolProgressPart 'Ran {0}'
  running: (cmd: string) => `${cmd} 실행 중`, // 'Running {0}'
  edited: (file: string) => `${file} 편집됨`, // chatThinkingContentPart 'Edited {0}'
  runCommand: (cmd: string) => `'${cmd}' 명령을 실행하시겠습니까?`, // runInTerminalTool 'Run `{0}` command?'
  allow: '허용', // runInTerminalTool 'Allow'
  allowOnce: '한 번 허용', // chatToolConfirmationSubPart 'Allow Once'
  skip: '건너뛰기', // runInTerminalTool 'Skip'
  showOutput: '출력 표시', // chatTerminalToolProgressPart

  /* 편집 검토 (chatSessionWorkingSet · chatEditingEditorOverlay · chatEditingActions) */
  filesChanged: (n: number) => (n === 1 ? '1 file changed' : `${n} files changed`), // 번역 없음
  setKeep: 'Keep', // chatSessionWorkingSet — 번역 없음
  setUndo: 'Undo', // chatSessionWorkingSet — 번역 없음
  keep: '유지', // chatEditingEditorActions 'Keep'
  undo: '실행 취소', // 'Undo'
  changesIn: (changes: number, files: number) => (files === 1 ? `1개 파일의 변경 내용 ${changes}개` : `${files}개 파일의 변경 내용 ${changes}개`),
  restoreCheckpoint: '검사점 복원',

  /* 인라인 제안 (inlineCompletions/commands · gutterIndicatorMenu) */
  accept: '수락',
  acceptWord: '단어 수락',
  prev: '이전',
  next: '다음',
  goToAccept: '이동 / 수락',
  openInlineChat: '인라인 채팅 열기', // inlineChatActions 'Open Inline Chat'

  /* 소스 제어 (scmInput) */
  generateCommit: '커밋 메시지 생성',
  commit: '커밋',
  changes: '변경 내용',
  commitPlaceholder: (branch: string) => `메시지(Ctrl+Enter(으)로 "${branch}"에 커밋)`, // git 확장 'Message ({0} to commit on "{1}")'
} as const;

/** 단축키 단추 id → 키보드에서 누를 키 */
export const KEY_TARGETS: Record<string, { key: string; ctrl?: boolean; label: string }> = {
  tab: { key: 'Tab', label: 'Tab' },
  'ctrl-i': { key: 'i', ctrl: true, label: 'Ctrl+I' },
  'ctrl-right': { key: 'ArrowRight', ctrl: true, label: 'Ctrl+→' },
};
