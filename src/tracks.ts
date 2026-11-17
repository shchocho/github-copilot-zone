import type { Track } from './types';

/** GitHub Copilot 체험 존 트랙 — VS Code 안의 Copilot 기능 셋 + GitHub.com 의 코딩 에이전트 */
export const TRACKS: Track[] = [
  {
    id: 'completions',
    name: '코드 완성',
    icon: '⌨️',
    color: '#0969da',
    textColor: '#0550ae',
    products: ['vscode'],
    about: '입력하는 자리에 회색 제안이 뜨고, 다음에 고칠 곳까지 미리 알려 줍니다.',
    intro: [{
      tone: 'problem',
      icon: '⌨️',
      caption: '같은 모양의 코드를 매번 처음부터 칩니다.\n이름 하나를 바꾸면 고칠 곳을 직접 찾아다녀야 합니다.',
    }],
  },
  {
    id: 'chat',
    name: 'Copilot Chat',
    icon: '💬',
    color: '#8250df',
    textColor: '#6639ba',
    products: ['vscode'],
    about: '코드를 묻고, 편집기 안에서 바로 고치고, 커밋 메시지까지 맡깁니다.',
    intro: [{
      tone: 'problem',
      icon: '💬',
      caption: '처음 보는 코드를 이해하는 데 반나절이 걸립니다.\n작은 수정과 커밋 메시지에도 손이 많이 갑니다.',
    }],
  },
  {
    id: 'agent',
    name: '에이전트',
    icon: '🤖',
    color: '#1a7f37',
    textColor: '#116329',
    products: ['vscode'],
    about: '목표를 주면 여러 파일을 고치고 테스트를 돌려 통과할 때까지 이어 갑니다.',
    intro: [{
      tone: 'problem',
      icon: '🤖',
      caption: '기능 하나에 라우트 · 서비스 · 테스트를 모두 고쳐야 합니다.\n테스트가 깨지면 원인을 찾느라 흐름이 끊깁니다.',
    }],
  },
  {
    id: 'cloud',
    name: '코딩 에이전트 · 리뷰',
    icon: '☁️',
    color: '#bc4c00',
    textColor: '#953800',
    products: ['github'],
    about: 'GitHub 이슈를 Copilot에 맡기면 PR을 만들어 오고, PR 리뷰도 받습니다.',
    intro: [{
      tone: 'problem',
      icon: '☁️',
      caption: '작은 이슈가 쌓여도 손댈 시간이 없습니다.\n리뷰어가 바빠 PR이 며칠씩 기다립니다.',
    }],
  },
];

export const TRACK_IDS = TRACKS.map(t => t.id);
export const trackById = (id: string) => TRACKS.find(t => t.id === id);

/** 트랙 색을 CSS 변수로 노출 (--track-<id>, --track-<id>-ink) */
export function applyTrackColors(el: HTMLElement = document.documentElement) {
  for (const t of TRACKS) {
    el.style.setProperty(`--track-${t.id}`, t.color);
    el.style.setProperty(`--track-${t.id}-ink`, t.textColor);
  }
}
