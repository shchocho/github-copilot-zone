/** 결과 화면의 결과물 창: 코드 파일 · 터미널 · GitHub 이슈/PR */
import type { ReactNode } from 'react';
import { CodeArtifact } from '../surfaces/vscode/VsCode';
import { GhArtifact } from '../surfaces/github/GitHubWeb';
import type { Artifact } from '../types';
import { Bold } from '../engine/text';

/** 결과물 종류별 뷰어 선택 */
export function ArtifactView({ a, ids }: { a: Artifact; ids: string[] }) {
  if (a.kind === 'code' || a.kind === 'term') return <CodeArtifact a={a} ids={ids} />;
  if (a.kind === 'gh') return <GhArtifact a={a} ids={ids} />;
  return null;
}

/* ---------------- 결과 화면 문서 창 ---------------- */
export function DocTabs({ tabs, onPick }: { tabs: { id: string; name: string; mark: ReactNode; on: boolean }[]; onPick: (id: string) => void }) {
  return (
    <nav className="doc-tabs">
      {tabs.map(t => (
        <button key={t.id} type="button" className={t.on ? 'on' : ''} onClick={() => onPick(t.id)}>
          {t.mark}<span>{t.name}</span>
        </button>
      ))}
    </nav>
  );
}

export function DocWindow({ app, mark, name, badge, note, tabs, children }: {
  app: string; mark?: ReactNode; name?: string; badge?: string; note?: string; tabs?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="desk-win is-doc" data-app={app}>
      {tabs}
      {name && (
        <header className="doc-bar">
          {mark}<b>{name}</b>
          {badge && <span className="doc-from is-made">{badge}</span>}
          <span className="doc-grow" />
        </header>
      )}
      <div className="doc-body">{children}</div>
      {note && <p className="doc-live" role="status"><span><Bold text={note} /></span></p>}
    </section>
  );
}
