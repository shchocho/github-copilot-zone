/**
 * VS Code + GitHub Copilot 화면 (agent: 'vscode').
 * 실제 VS Code 1.146~1.148 의 배치를 따른다: 제목 표시줄(메뉴 · 명령 센터) · 작업 표시줄 · 기본 사이드바(탐색기 · 소스 제어) ·
 * 편집기(탭 · 이동 경로 · 코드) · 패널(터미널) · 보조 사이드바(채팅) · 상태 표시줄. 테마는 기본값인 Dark Modern.
 * 문구 출처: ./labels.ts, 조사 기록: docs/UI-SOURCES.md
 */
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import type { Artifact, CodeFile, CodeLine, MsgApprove, PlayState, Scenario, TermLine } from '../../types';
import type { Mark } from '../../components/chrome';
import { filterBy } from '../../engine/text';
import { Highlight, langOf } from './highlight';
import { KEY_TARGETS, L } from './labels';

const ci = (name: string, extra = '') => <i className={`codicon codicon-${name}${extra ? ` ${extra}` : ''}`} aria-hidden="true" />;
const base = (p: string) => p.split('/').pop() ?? p;

/** 화면에 지금 보일 줄 수: 쓰는 중이면 그 줄까지, 아직 만들지 않은 새 파일이면 0 */
function writingOf(id: string, a: Artifact, st: PlayState) {
  return st.writing === id ? st.rows : a.origin === 'made' && !st.opened.includes(id) ? 0 : null;
}
function byKind(s: Scenario, kind: string) {
  return Object.entries(s.workbench?.artifacts ?? {}).filter(([, a]) => a.kind === kind);
}
/** 가장 최근에 연 것, 없으면 처음부터 열려 있는(read) 것 */
function current(list: [string, Artifact][], st: PlayState) {
  return [...st.opened].reverse().find(k => list.some(([id]) => id === k)) ?? list.find(([, a]) => a.origin === 'read')?.[0];
}
function fileState(f: CodeFile, ids: string[], shown: boolean) {
  const kept = !!f.kept && ids.includes(f.kept);
  const pending = !kept && filterBy(f.lines, ids).some(l => l.diff);
  if (f.added && shown) return 'U';
  if (pending || kept || (f.touched && ids.includes(f.touched))) return 'M';
  return '';
}

export function VsCodeWindow({ s, st, ids, mark, ask, onSend, target, onAct, streamRef, children }: {
  s: Scenario; st: PlayState; ids: string[]; mark: Mark; ask: string | null; onSend?: () => void;
  target?: string; onAct: () => void; streamRef: RefObject<HTMLDivElement | null>; children: ReactNode;
}) {
  const vs = s.vscode ?? { repo: 'workspace', branch: 'main', tree: [] };
  const codes = byKind(s, 'code');
  const terms = byKind(s, 'term');
  const activeId = current(codes, st);
  const tabs = codes.filter(([id, a]) => a.origin === 'read' || st.opened.includes(id));
  const termId = [...st.opened].reverse().find(k => terms.some(([id]) => id === k));
  const hot = (id: string) => target === id;

  // 키보드로도 누를 수 있게 (Tab · Ctrl+I · Ctrl+→)
  useEffect(() => {
    const k = target ? KEY_TARGETS[target] : undefined;
    if (!k) return;
    const on = (e: KeyboardEvent) => {
      if (e.key !== k.key || !!k.ctrl !== (e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      onAct();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [target, onAct]);

  const status = (path: string) => {
    const hit = codes.find(([, a]) => a.code?.path === path);
    if (!hit) return '';
    const shown = st.opened.includes(hit[0]) || hit[1].origin === 'read';
    return hit[1].code!.added && !shown ? 'none' : fileState(hit[1].code!, ids, shown);
  };
  const activeArt = activeId ? s.workbench!.artifacts[activeId] : undefined;
  const activePath = activeArt?.code?.path;
  const chat = vs.chat !== false;
  const editsOn = !!vs.edits && ids.includes(vs.edits.on) && !ids.includes(vs.edits.kept);
  const cursorLn = (() => {
    const f = activeArt?.code;
    if (!f) return 1;
    const i = filterBy(f.lines, ids).findIndex(l => l.cursor);
    return i < 0 ? 1 : i + 1;
  })();

  return (
    <div className="vsc" data-surface="vscode">
      <TitleBar repo={vs.repo} zone={`sc-zone ${mark('ribbon')}`} />
      <div className="vsc-body">
        <nav className="vsc-act" aria-label="작업 표시줄">
          {([['files', L.explorer, 'explorer'], ['search', L.search, ''], ['source-control', L.scm, 'scm'], ['debug-alt', L.run, ''], ['extensions', L.extensions, '']] as const).map(([icon, name, view]) => {
            const on = (vs.view ?? 'explorer') === view;
            const badge = view === 'scm' ? (vs.scm ? (vs.scm.done && ids.includes(vs.scm.done) ? 0 : vs.scm.changes.length) : vs.tree.filter(p => status(p) && status(p) !== 'none').length) : 0;
            return <span key={icon} className={on ? 'on' : undefined} title={name}>{ci(icon)}{badge > 0 && <b>{badge}</b>}</span>;
          })}
          <span className="vsc-act-end" title="계정">{ci('account')}</span>
          <span title="관리">{ci('settings-gear')}</span>
        </nav>
        <aside className="vsc-side">
          {vs.view === 'scm' && vs.scm ? <ScmView vs={vs} ids={ids} hot={hot} onAct={onAct} /> : <Explorer vs={vs} active={activePath} status={status} />}
        </aside>
        <div className="vsc-main">
          <div className="vsc-tabs" role="tablist">
            {tabs.map(([id, a]) => {
              const st2 = a.code ? fileState(a.code, ids, true) : '';
              return (
                <span key={id} role="tab" aria-selected={id === activeId} className={`vsc-tab${id === activeId ? ' on' : ''}${st2 ? ` is-${st2}` : ''}`}>
                  <FileIcon path={a.code!.path} />{base(a.code!.path)}{st2 && <em>{st2}</em>}{ci('close')}
                </span>
              );
            })}
          </div>
          {activeArt?.code && (
            <div className="vsc-crumbs">
              {activeArt.code.path.split('/').map((p, i, all) => <span key={i}>{i === all.length - 1 && <FileIcon path={p} />}{p}{i < all.length - 1 && ci('chevron-right')}</span>)}
            </div>
          )}
          <div className={`vsc-editor sc-zone ${mark('canvas')}`}>
            {activeArt?.code
              ? <CodeView key={activeId} f={activeArt.code} writing={writingOf(activeId!, activeArt, st)} ids={ids} hot={hot} onAct={onAct} overlayKeep={!chat || !vs.edits} />
              : <div className="vsc-empty">{ci('copilot')}</div>}
          </div>
          {termId && (
            <Terminal art={s.workbench!.artifacts[termId]} writing={writingOf(termId, s.workbench!.artifacts[termId], st)} ids={ids} repo={vs.repo} />
          )}
        </div>
        {chat && (
          <section className={`vsc-chat sc-zone ${mark('pane')}`} aria-label={L.chat}>
            <header className="vsc-chat-head">
              <b>{L.chat}</b>
              <span>{ci('add')}{ci('history')}{ci('ellipsis')}{ci('close')}</span>
            </header>
            <div className="vsc-chat-stream sc-stream-in" ref={streamRef}>{children}</div>
            {editsOn && vs.edits && (
              <div className="vsc-set">
                <div className="vsc-set-head">
                  {ci('chevron-right')}<b>{L.filesChanged(vs.edits.files.length)}</b>
                  {vs.edits.added != null && <span className="vsc-plus">+{vs.edits.added}</span>}
                  {vs.edits.removed != null && <span className="vsc-minus">-{vs.edits.removed}</span>}
                  <span className="vsc-set-btns">
                    {hot('keep')
                      ? <button type="button" className="vsc-btn is-primary is-hunt" data-act="keep" onClick={onAct}>{L.setKeep}</button>
                      : <span className="vsc-btn is-primary">{L.setKeep}</span>}
                    <span className="vsc-btn">{L.setUndo}</span>
                  </span>
                </div>
                <ul>{vs.edits.files.map(f => <li key={f}><FileIcon path={f} />{base(f)}<small>{f.split('/').slice(0, -1).join('/')}</small></li>)}</ul>
              </div>
            )}
            <div className={`vsc-input sc-zone ${mark('composer')}`}>
              {!!vs.context?.length && <div className="vsc-ctx">{vs.context.map(c => <span key={c}><FileIcon path={c} />{base(c)}</span>)}</div>}
              <p className={ask ? 'is-filled' : undefined}>{ask ?? L.placeholder('Copilot')}</p>
              <div className="vsc-input-bar">
                <span className="vsc-pick" title={L.addContext}>{ci('add')}</span>
                <span className="vsc-pick">{L.sessionTarget}{ci('chevron-down')}</span>
                <span className="vsc-pick">{vs.agent ?? 'Agent'}{ci('chevron-down')}</span>
                <span className="vsc-pick">{L.model}{ci('chevron-down')}</span>
                <span className="vsc-pick" title={L.permissions}>{ci('shield')}{ci('chevron-down')}</span>
                {onSend
                  ? <button type="button" className="vsc-send sc-pane-send is-hunt" aria-label={L.send} onClick={onSend}>{ci('send')}</button>
                  : <span className="vsc-send" aria-hidden="true">{ci('send')}</span>}
              </div>
            </div>
          </section>
        )}
      </div>
      <footer className="vsc-status">
        <span className="vsc-remote">{ci('remote')}</span>
        <span>{ci('git-branch')}{vs.branch}{vs.scm?.done && ids.includes(vs.scm.done) ? '' : '*'}</span>
        <span>{ci('sync')}</span>
        <span>{ci('error')}0 {ci('warning')}0</span>
        <span className="vsc-status-end">{L.lnCol(cursorLn, 1)}</span>
        <span>{L.spaces}</span>
        <span>UTF-8</span>
        <span>CRLF</span>
        <span>{'{ }'} {activePath ? langName(activePath) : 'Plain Text'}</span>
        <span title="GitHub Copilot">{ci('copilot')}</span>
        <span>{ci('bell')}</span>
      </footer>
    </div>
  );
}

function langName(path: string) {
  const l = langOf(path);
  return l === 'ts' ? (path.endsWith('.js') ? 'JavaScript' : 'TypeScript') : l === 'json' ? 'JSON' : l === 'md' ? 'Markdown' : l === 'yaml' ? 'YAML' : 'Plain Text';
}

function TitleBar({ repo, zone }: { repo: string; zone: string }) {
  return (
    <div className={`vsc-title ${zone}`}>
      <span className="vsc-logo" aria-hidden="true">{ci('vscode')}</span>
      <span className="vsc-menu">{L.menu.map(m => <i key={m}>{m}</i>)}</span>
      <span className="vsc-nav">{ci('arrow-left')}{ci('arrow-right')}</span>
      <span className="vsc-cmd">{ci('search')}{repo}</span>
      <span className="vsc-copilot" title="GitHub Copilot">{ci('copilot')}{ci('chevron-down')}</span>
      <span className="vsc-layout">{ci('layout-sidebar-left')}{ci('layout-panel')}{ci('layout-sidebar-right')}</span>
      <span className="vsc-win">{ci('chrome-minimize')}{ci('chrome-maximize')}{ci('chrome-close')}</span>
    </div>
  );
}

/** Seti 아이콘 테마를 닮은 파일 아이콘 */
export function FileIcon({ path }: { path: string }) {
  const l = langOf(path);
  const name = base(path);
  if (name === 'package.json') return <i className="vsc-fi is-npm" aria-hidden="true">{ci('json')}</i>;
  if (l === 'ts') return <i className="vsc-fi is-ts" aria-hidden="true">TS</i>;
  if (l === 'json') return <i className="vsc-fi is-json" aria-hidden="true">{'{}'}</i>;
  if (l === 'md') return <i className="vsc-fi is-md" aria-hidden="true">{ci('markdown')}</i>;
  if (l === 'yaml') return <i className="vsc-fi is-yaml" aria-hidden="true">!</i>;
  return <i className="vsc-fi" aria-hidden="true">{ci('file')}</i>;
}

function Explorer({ vs, active, status }: { vs: NonNullable<Scenario['vscode']>; active?: string; status: (p: string) => string }) {
  // 경로 목록 → 폴더가 먼저 오는 트리
  type Node = { name: string; path: string; dirs: Map<string, Node>; files: string[] };
  const root: Node = { name: '', path: '', dirs: new Map(), files: [] };
  for (const p of vs.tree) {
    if (status(p) === 'none') continue; // 에이전트가 아직 만들지 않은 새 파일
    const parts = p.split('/');
    let n = root;
    parts.slice(0, -1).forEach((d, i) => {
      if (!n.dirs.has(d)) n.dirs.set(d, { name: d, path: parts.slice(0, i + 1).join('/'), dirs: new Map(), files: [] });
      n = n.dirs.get(d)!;
    });
    n.files.push(p);
  }
  const rows: ReactNode[] = [];
  const walk = (n: Node, depth: number) => {
    for (const d of [...n.dirs.values()].sort((a, b) => a.name.localeCompare(b.name))) {
      const st = vs.tree.some(p => p.startsWith(d.path + '/') && status(p) && status(p) !== 'none') ? 'dot' : '';
      rows.push(<li key={d.path} style={{ '--d': depth } as React.CSSProperties} className={st ? 'is-dot' : undefined}>{ci('chevron-down')}{d.name}</li>);
      walk(d, depth + 1);
    }
    for (const f of [...n.files].sort((a, b) => base(a).localeCompare(base(b)))) {
      const st = status(f);
      rows.push(
        <li key={f} style={{ '--d': depth } as React.CSSProperties} className={[f === active ? 'on' : '', st ? `is-${st}` : ''].filter(Boolean).join(' ') || undefined}>
          <FileIcon path={f} />{base(f)}{st && <em>{st}</em>}
        </li>,
      );
    }
  };
  walk(root, 0);
  return (
    <>
      <header className="vsc-side-head"><b>{L.explorer}</b>{ci('ellipsis')}</header>
      <div className="vsc-tree-head">{ci('chevron-down')}<b>{vs.repo.toUpperCase()}</b></div>
      <ul className="vsc-tree">{rows}</ul>
      <div className="vsc-tree-head is-closed">{ci('chevron-right')}<b>{L.outline}</b></div>
      <div className="vsc-tree-head is-closed">{ci('chevron-right')}<b>{L.timeline}</b></div>
    </>
  );
}

function ScmView({ vs, ids, hot, onAct }: { vs: NonNullable<Scenario['vscode']>; ids: string[]; hot: (id: string) => boolean; onAct: () => void }) {
  const scm = vs.scm!;
  const done = !!scm.done && ids.includes(scm.done);
  const filled = !done && ids.includes(scm.on);
  const lines = filled ? scm.msg.split('\n') : [];
  return (
    <>
      <header className="vsc-side-head"><b>{L.scm}</b>{ci('ellipsis')}</header>
      <div className="vsc-scm">
        <div className={`vsc-scm-input${filled ? ' is-filled' : ''}`}>
          {filled ? <div>{lines.map((l, i) => <p key={i}>{l || '\u00a0'}</p>)}</div> : <p className="is-ph">{L.commitPlaceholder(vs.branch)}</p>}
          {hot('commit-msg')
            ? <button type="button" className="vsc-sparkle is-hunt" data-act="commit-msg" title={L.generateCommit} aria-label={L.generateCommit} onClick={onAct}>{ci('sparkle')}</button>
            : <span className="vsc-sparkle" title={L.generateCommit}>{ci('sparkle')}</span>}
        </div>
        {hot('commit')
          ? <button type="button" className="vsc-commit is-hunt" data-act="commit" onClick={onAct}>{ci('check')}{L.commit}</button>
          : <span className="vsc-commit">{ci('check')}{L.commit}</span>}
        <div className="vsc-tree-head">{ci('chevron-down')}<b>{L.changes}</b><em>{done ? 0 : scm.changes.length}</em></div>
        {!done && (
          <ul className="vsc-tree is-scm">
            {scm.changes.map(c => (
              <li key={c.path} className={`is-${c.st}`}><FileIcon path={c.path} />{base(c.path)}<small>{c.path.split('/').slice(0, -1).join('/')}</small><em>{c.st}</em></li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/** 편집기: 줄 번호 · 구문 강조 · 고스트 텍스트 · 다음 편집 제안 · 채팅 편집(diff) · 인라인 채팅 */
function CodeView({ f, writing, ids, hot, onAct, overlayKeep }: {
  f: CodeFile; writing: number | null; ids: string[]; hot: (id: string) => boolean; onAct: () => void; overlayKeep: boolean;
}) {
  const lang = langOf(f.path);
  const kept = !!f.kept && ids.includes(f.kept);
  const all = filterBy(f.lines, ids).filter(l => !(kept && l.diff === 'del'));
  const lines = writing == null ? all : all.slice(0, writing);
  const pending = kept ? 0 : lines.filter(l => l.diff).length;
  const inlineOpen = !!f.inline && ids.includes(f.inline.on) && !(f.inline.done && ids.includes(f.inline.done));
  const firstGhost = lines.findIndex(l => l.g && !(l.ga && ids.includes(l.ga)));
  let n = 0;
  const rows: ReactNode[] = [];
  lines.forEach((l, i) => {
    if (inlineOpen && f.inline!.at === i) rows.push(<InlineChatWidget key="inline" text={f.inline!.text} edited={pending > 0} hot={hot} onAct={onAct} />);
    const accepted = !l.g || (!!l.ga && ids.includes(l.ga));
    const virtual = l.t === '' && !!l.g && !accepted; // 여러 줄 고스트 텍스트의 둘째 줄부터: 줄 번호 없음
    const del = l.diff === 'del';
    if (!virtual && !del) n++;
    const nesDone = !!l.nes && ids.includes(l.nes.flag);
    const text = l.nes && nesDone ? l.t.replace(l.nes.from, l.nes.to) : l.t;
    const cls = [l.cursor ? 'is-cursor' : '', !kept && l.diff ? `is-${l.diff}` : '', virtual ? 'is-virtual' : '', l.nes && !nesDone ? 'is-nes' : ''].filter(Boolean).join(' ');
    rows.push(
      <div key={i} className={`vsc-ln${cls ? ` ${cls}` : ''}`}>
        <span className="vsc-gut">
          {l.nes && !nesDone
            ? (hot('tab')
              ? <button type="button" className="vsc-nes-arrow is-hunt" data-act="tab" title={L.goToAccept} aria-label={`${L.goToAccept} (Tab)`} onClick={onAct}>{ci('arrow-right')}</button>
              : <span className="vsc-nes-arrow" title={L.goToAccept}>{ci('arrow-right')}</span>)
            : !virtual && !del ? n : ''}
        </span>
        <code>
          {l.nes && !nesDone ? <NesText t={l.t} from={l.nes.from} lang={lang} /> : <Highlight code={text} lang={lang} />}
          {l.g && (accepted ? <Highlight code={l.g} lang={lang} /> : <span className="vsc-ghost">{l.g}</span>)}
          {l.cursor && !inlineOpen && <span className="vsc-caret" aria-hidden="true" />}
          {l.nes && !nesDone && <span className="vsc-nes-box"><Highlight code={l.nes.to} lang={lang} /></span>}
        </code>
        {i === firstGhost && <GhostBar hot={hot} onAct={onAct} />}
        {l.cursor && hot('ctrl-i') && (
          <button type="button" className="vsc-ichint is-hunt" data-act="ctrl-i" title={`${L.openInlineChat} (Ctrl+I)`} onClick={onAct}>{ci('sparkle')}<span>{L.openInlineChat}</span><kbd>Ctrl+I</kbd></button>
        )}
      </div>,
    );
  });
  if (inlineOpen && f.inline!.at >= lines.length) rows.push(<InlineChatWidget key="inline" text={f.inline!.text} edited={pending > 0} hot={hot} onAct={onAct} />);
  const changes = lines.filter((l, i) => l.diff && (i === 0 || !lines[i - 1].diff)).length;
  return (
    <div className="vsc-code" data-lang={lang}>
      {rows}
      {writing != null && writing < all.length && <div className="vsc-ln is-typing"><span className="vsc-gut" /><code><span className="vsc-caret" /></code></div>}
      {pending > 0 && !inlineOpen && (
        <div className="vsc-overlay" role="toolbar">
          {overlayKeep && hot('keep')
            ? <button type="button" className="vsc-btn is-primary is-hunt" data-act="keep" onClick={onAct}>{L.keep}</button>
            : <span className="vsc-btn is-primary">{L.keep}</span>}
          <span className="vsc-btn">{L.undo}</span>
          <span className="vsc-overlay-n">{ci('chevron-up')}{ci('chevron-down')}{L.changesIn(changes, 1)}</span>
        </div>
      )}
    </div>
  );
}

function NesText({ t, from, lang }: { t: string; from: string; lang: string }) {
  const at = t.indexOf(from);
  if (at < 0) return <Highlight code={t} lang={lang} />;
  return <><Highlight code={t.slice(0, at)} lang={lang} /><span className="vsc-nes-del">{from}</span><Highlight code={t.slice(at + from.length)} lang={lang} /></>;
}

function GhostBar({ hot, onAct }: { hot: (id: string) => boolean; onAct: () => void }) {
  return (
    <span className="vsc-ghostbar" role="toolbar">
      {ci('chevron-left')}<span>1/1</span>{ci('chevron-right')}
      {hot('tab')
        ? <button type="button" className="is-hunt" data-act="tab" onClick={onAct}>{L.accept} <kbd>Tab</kbd></button>
        : <span>{L.accept} <kbd>Tab</kbd></span>}
      {hot('ctrl-right')
        ? <button type="button" className="is-hunt" data-act="ctrl-right" onClick={onAct}>{L.acceptWord} <kbd>Ctrl+→</kbd></button>
        : <span>{L.acceptWord} <kbd>Ctrl+→</kbd></span>}
      {ci('ellipsis')}
    </span>
  );
}

function InlineChatWidget({ text, edited, hot, onAct }: { text: string; edited: boolean; hot: (id: string) => boolean; onAct: () => void }) {
  return (
    <div className="vsc-inline" role="group" aria-label="인라인 채팅">
      <div className="vsc-inline-box">
        {ci('copilot')}
        <p>{text}</p>
        {!edited && (hot('inline-send')
          ? <button type="button" className="vsc-send is-hunt" data-act="inline-send" aria-label={L.send} onClick={onAct}>{ci('send')}</button>
          : <span className="vsc-send">{ci('send')}</span>)}
      </div>
      {edited && (
        <div className="vsc-inline-acts">
          {hot('keep')
            ? <button type="button" className="vsc-btn is-primary is-hunt" data-act="keep" onClick={onAct}>{L.keep}</button>
            : <span className="vsc-btn is-primary">{L.keep}</span>}
          <span className="vsc-btn">{L.undo}</span>
        </div>
      )}
    </div>
  );
}

function Terminal({ art, writing, ids, repo }: { art: Artifact; writing: number | null; ids: string[]; repo: string }) {
  const all = filterBy(art.term?.lines ?? [], ids) as TermLine[];
  const lines = writing == null ? all : all.slice(0, writing);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [lines.length]); // 실제 터미널처럼 마지막 줄을 보인다
  return (
    <section className="vsc-panel" aria-label={L.terminal}>
      <header>{L.panelTabs.map(t => <i key={t} className={t === L.terminal ? 'on' : undefined}>{t}</i>)}<span>{ci('terminal-powershell')}{art.term?.title ?? 'pwsh'}{ci('add')}{ci('trash')}{ci('chevron-up')}{ci('close')}</span></header>
      <div className="vsc-term" ref={box}>
        {lines.map((l, i) => (
          <p key={i} className={l.tone ? `is-${l.tone}` : undefined}>
            {l.tone === 'cmd' ? <><span className="vsc-ps">PS D:\{repo}&gt;</span> {l.t}</> : l.t || '\u00a0'}
          </p>
        ))}
        {(writing == null || writing >= all.length) && <p><span className="vsc-ps">PS D:\{repo}&gt;</span> <span className="vsc-term-caret" /></p>}
      </div>
    </section>
  );
}

/**
 * 채팅 안의 확인 카드. kind 로 세 가지:
 * - 기본(터미널 명령): runInTerminalTool 의 '{명령}' 명령을 실행하시겠습니까? · 허용 · 건너뛰기 (rows[0].value = 명령)
 * - 'mcp': MCP 도구 실행 확인 — what 은 'Run {0}' 제목, rows 는 도구 입력, line 은 도구 설명, warn 은 경고 문구 · 한 번 허용 · 건너뛰기
 * - 'plan': 계획 검토 카드(Plan summary) — rows 는 계획 단계 · Implement Plan · Approve Plan Only · 거부
 */
export function VsConfirm({ a, denied, onAllow, onDeny, onBack }: { a: MsgApprove; denied: boolean; onAllow: () => void; onDeny: () => void; onBack: () => void }) {
  const plan = a.kind === 'plan';
  const mcp = a.kind === 'mcp';
  const cmd = !plan && !mcp ? a.rows?.[0]?.value : undefined;
  if (denied) {
    return (
      <div className="wb-perm vsc-confirm is-denied" role="status">
        <p className="vsc-confirm-t">{plan ? L.planSummary : a.what}</p>
        <p className="vsc-confirm-note">{a.denied ?? '건너뛰었습니다.'}</p>
        <div className="vsc-confirm-btns"><button type="button" className="wb-perm-b vsc-btn" onClick={onBack}>다시 보기</button></div>
      </div>
    );
  }
  return (
    <div className={`wb-perm vsc-confirm${plan ? ' is-plan' : ''}`} role="dialog" aria-label={plan ? L.planSummary : a.what}>
      <p className="vsc-confirm-t">{ci(plan ? 'checklist' : mcp ? 'tools' : 'terminal')}{plan ? L.planSummary : a.what}</p>
      {a.sub && <p className="vsc-confirm-sub">{a.sub}</p>}
      {plan && a.line && <p className="vsc-confirm-note">{a.line}</p>}
      {plan && <ol className="vsc-plan">{(a.rows ?? []).map((r, i) => <li key={i}><span><b>{r.label}</b> — {r.value}</span></li>)}</ol>}
      {mcp && a.line && <p className="vsc-confirm-note">{a.line}</p>}
      {mcp && !!a.rows?.length && (
        <>
          <p className="vsc-confirm-h">{L.input}</p>
          <pre className="vsc-confirm-cmd">{toolInput(a.rows)}</pre>
        </>
      )}
      {cmd && <pre className="vsc-confirm-cmd">{cmd}</pre>}
      {!plan && !mcp && a.line && <p className="vsc-confirm-note">{a.line}</p>}
      {mcp && a.warn && <p className="vsc-confirm-note is-warn">{a.warn}</p>}
      {plan && <p className="vsc-plan-links"><span className="vsc-btn">{ci('go-to-file')}{L.openFullPlan}</span><span className="vsc-btn">{L.submitFeedback}</span></p>}
      <div className="vsc-confirm-btns">
        <button type="button" className="wb-perm-b is-go vsc-btn is-primary" onClick={onAllow}>{a.go ?? (plan ? L.implementPlan : mcp ? L.allowOnce : L.allow)}{!plan && <span className="vsc-split">{ci('chevron-down')}</span>}</button>
        {plan && <span className="vsc-btn">{L.approvePlanOnly}</span>}
        <button type="button" className="wb-perm-b vsc-btn" onClick={onDeny}>{plan ? L.reject : L.skip}</button>
      </div>
    </div>
  );
}

/** MCP 도구 입력을 JSON 모양으로 (숫자는 따옴표 없이) */
function toolInput(rows: { label: string; value: string }[]) {
  return JSON.stringify(Object.fromEntries(rows.map(r => [r.label, /^\d+$/.test(r.value) ? Number(r.value) : r.value])), null, 2);
}

/** 채팅의 도구 실행 줄: 끝나면 ✓, 진행 중이면 돌아가는 아이콘. `백틱` 은 코드 글꼴 */
export function VsStep({ text, active }: { text: string; active: boolean }) {
  return (
    <div className={`vsc-step${active ? ' is-now' : ''}`}>
      {active ? ci('loading', 'codicon-modifier-spin') : ci('check')}
      <span>{(active ? text.replace(/ 실행(됨)?$/, ' 실행 중') : text).split(/(`[^`]+`)/).map((x, i) => (x.startsWith('`') ? <code key={i}>{x.slice(1, -1)}</code> : x))}</span>
    </div>
  );
}

/** 채팅의 작업 중 표시 */
export function VsWorking() {
  return <p className="vsc-working" aria-live="polite">{ci('loading', 'codicon-modifier-spin')}{L.working}</p>;
}

/** 결과 화면 · 다른 곳에서 코드 파일을 정적으로 보여 줄 때 */
export function CodeArtifact({ a, ids }: { a: Artifact; ids: string[] }) {
  if (a.kind === 'term') {
    return <div className="vsc vsc-static"><Terminal art={a} writing={null} ids={ids} repo="sensor-hub" /></div>;
  }
  if (!a.code) return null;
  return (
    <div className="vsc vsc-static">
      <div className="vsc-tabs"><span className="vsc-tab on"><FileIcon path={a.code.path} />{base(a.code.path)}</span></div>
      <div className="vsc-editor"><CodeView f={{ ...a.code, kept: a.code.kept, inline: undefined }} writing={null} ids={[...ids, ...doneFlags(a.code)]} hot={() => false} onAct={() => {}} overlayKeep={false} /></div>
    </div>
  );
}
/** 결과 화면에서는 고스트 · 제안 · 편집을 모두 받아들인 모습으로 */
function doneFlags(f: CodeFile) {
  const out = new Set<string>();
  if (f.kept) out.add(f.kept);
  for (const l of f.lines as CodeLine[]) { if (l.ga) out.add(l.ga); if (l.nes) out.add(l.nes.flag); }
  return [...out];
}
