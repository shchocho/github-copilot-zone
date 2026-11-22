import type { JSX } from 'react';
import { SEMANTIC_ICONS } from './semanticIcons';

/** 상황/흐름/요약에 쓰는 의미 아이콘 (선 아이콘) */
export function SemIcon({ name, className }: { name?: string; className?: string }) {
  const svg = name ? SEMANTIC_ICONS[name] : undefined;
  if (!svg) return null;
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** 홈 · 목록 화면의 영역(트랙) 아이콘 (Codicons) */
const TRACK_ICONS: Record<string, JSX.Element> = {
  completions: <i className="codicon codicon-sparkle" />,
  chat: <i className="codicon codicon-comment-discussion" />,
  agent: <i className="codicon codicon-agent" />,
  cloud: <i className="codicon codicon-git-pull-request" />,
};
export function TrackIcon({ id, fallback }: { id: string; fallback?: string }) {
  return TRACK_ICONS[id] ?? <span>{fallback}</span>;
}
