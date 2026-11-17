/**
 * GitHub.com 화면 (agent: 'github') — 이슈 · PR 페이지와 Copilot 클라우드 에이전트 세션 로그.
 * GitHub 웹은 한국어 화면이 없으므로 영어 UI 그대로 둔다(버튼 이름: docs.github.com 2026-11 기준, docs/UI-SOURCES.md).
 * 화면을 누를 곳: assign(Assignees 의 Copilot) · assign-go(Assign) · review(Reviewers 의 Copilot) · merge · 코멘트 단추(act.id)
 */
import type { ReactNode, RefObject } from 'react';
import type { Artifact, GhEvent, GhPage, PlayState, Scenario } from '../../types';
import type { Mark } from '../../components/chrome';
import { Bold, filterBy, passes } from '../../engine/text';

const oi = (name: string) => <i className={`codicon codicon-${name}`} aria-hidden="true" />;

function Avatar({ who, bot }: { who: string; bot?: boolean }) {
  return bot
    ? <span className="gh-av is-bot" aria-hidden="true"><img src="logo/ghcp/copilot.svg" alt="" /></span>
    : <span className="gh-av" aria-hidden="true" style={{ '--h': [...who].reduce((a, c) => a + c.charCodeAt(0), 0) % 360 } as React.CSSProperties}>{who[0]?.toUpperCase()}</span>;
}

function pages(s: Scenario) {
  return Object.entries(s.workbench?.artifacts ?? {}).filter(([, a]) => a.kind === 'gh');
}

export function GitHubWeb({ s, st, ids, mark, target, onAct, streamRef, children }: {
  s: Scenario; st: PlayState; ids: string[]; mark: Mark; target?: string; onAct: () => void;
  streamRef: RefObject<HTMLDivElement | null>; children: ReactNode;
}) {
  const list = pages(s);
  const id = [...st.opened].reverse().find(k => list.some(([i]) => i === k)) ?? list.find(([, a]) => a.origin === 'read')?.[0] ?? list[0]?.[0];
  const art = id ? s.workbench!.artifacts[id] : undefined;
  const g = art?.gh;
  const hot = (x: string) => target === x;
  if (!g) return null;
  const state = Object.entries(g.stateBy ?? {}).reduce((acc, [flag, v]) => (ids.includes(flag) ? v : acc), g.state);
  const dialogOpen = !!g.dialog && ids.includes(g.dialog.on) && !ids.includes(g.dialog.done);
  const [owner, repo] = g.repo.split('/');
  return (
    <div className="gh" data-surface="github">
      <header className={`gh-top sc-zone ${mark('ribbon')}`}>
        <div className="gh-top-row">
          <span className="gh-burger">{oi('three-bars')}</span>
          <img className="gh-logo" src="logo/ghcp/github.svg" alt="GitHub" />
          <span className="gh-crumb">{owner} <i>/</i> <b>{repo}</b></span>
          <span className="gh-search">{oi('search')}Type <kbd>/</kbd> to search</span>
          <span className="gh-top-icons"><span className="gh-copilot-btn"><img src="logo/ghcp/copilot.svg" alt="" />{oi('chevron-down')}</span>{oi('add')}{oi('issues')}{oi('git-pull-request')}{oi('inbox')}<Avatar who="me" /></span>
        </div>
        <nav className="gh-repo-tabs">
          {[['code', 'Code'], ['issues', 'Issues'], ['git-pull-request', 'Pull requests'], ['agent', 'Agents'], ['play-circle', 'Actions'], ['table', 'Projects'], ['shield', 'Security'], ['graph', 'Insights'], ['gear', 'Settings']].map(([ic, name]) => (
            <span key={name} className={(g.type === 'issue' ? name === 'Issues' : name === 'Pull requests') ? 'on' : undefined}>{oi(ic)}{name}</span>
          ))}
        </nav>
      </header>
      <div className="gh-body">
        <main className={`gh-page sc-zone ${mark('canvas')}`}>
          <h1 className="gh-title">{g.title} <span>#{g.number}</span></h1>
          <div className="gh-meta">
            <span className={`gh-state is-${state}`}>{oi(g.type === 'issue' ? 'issues' : state === 'merged' ? 'git-merge' : 'git-pull-request')}{state === 'merged' ? 'Merged' : state === 'draft' ? 'Draft' : 'Open'}</span>
            {g.type === 'pr'
              ? <span><b>{g.author}</b> {state === 'merged' ? 'merged' : 'wants to merge'} commits into <code>{g.base ?? 'main'}</code> from <code>{g.head}</code></span>
              : <span><b>{g.author}</b> opened this issue</span>}
          </div>
          {g.type === 'pr' && (
            <nav className="gh-pr-tabs">
              <span className="on">{oi('comment-discussion')}Conversation</span><span>{oi('git-commit')}Commits</span><span>{oi('checklist')}Checks</span><span>{oi('diff')}Files changed{g.files != null && <em>{g.files}</em>}</span>
            </nav>
          )}
          <div className="gh-columns">
            <div className="gh-timeline">
              <article className="gh-comment">
                <Avatar who={g.author} bot={g.author === 'Copilot'} />
                <div className="gh-comment-box">
                  <header><b>{g.author}</b> commented</header>
                  <div className="gh-md">{g.body.map((b, i) => <p key={i}><Bold text={b} /></p>)}</div>
                </div>
              </article>
              {filterBy(g.events, ids).map((e, i) => <Event key={i} e={e} hot={hot} onAct={onAct} />)}
              {g.type === 'pr' && <MergeBox g={g} ids={ids} state={state} hot={hot} onAct={onAct} />}
            </div>
            <aside className="gh-sidebar">
              {g.type === 'pr' && (
                <section>
                  <h3>Reviewers{oi('gear')}</h3>
                  {(g.reviewers ?? []).filter(r => passes(ids, r)).map(r => <p key={r.who} className="gh-person"><Avatar who={r.who} bot={r.bot} />{r.who}{r.state && <small>{r.state}</small>}</p>)}
                  {hot('review')
                    ? <button type="button" className="gh-suggest is-hunt" data-act="review" onClick={onAct}><Avatar who="Copilot" bot />Copilot <span>Request</span></button>
                    : !(g.reviewers ?? []).some(r => r.bot && passes(ids, r)) && <p className="gh-suggest"><Avatar who="Copilot" bot />Copilot <span>Request</span></p>}
                </section>
              )}
              <section>
                <h3>Assignees{hot('assign')
                  ? <button type="button" className="gh-gear is-hunt" data-act="assign" aria-label="Assignees" onClick={onAct}>{oi('gear')}</button>
                  : oi('gear')}</h3>
                {(g.assignees ?? []).filter(a => passes(ids, a)).map(a => <p key={a.who} className="gh-person"><Avatar who={a.who} bot={a.bot} />{a.who}</p>)}
                {!(g.assignees ?? []).some(a => passes(ids, a)) && <p className="gh-none">No one — <u>assign yourself</u></p>}
              </section>
              <section><h3>Labels{oi('gear')}</h3><p className="gh-labels">{(g.labels ?? []).map(l => <span key={l}>{l}</span>)}</p></section>
              <section><h3>Projects{oi('gear')}</h3><p className="gh-none">None yet</p></section>
              <section><h3>Development{oi('gear')}</h3><p className="gh-none">{g.type === 'issue' && g.events.some(e => e.kind === 'pr-link' && passes(ids, e)) ? 'Copilot opened a pull request' : 'No branches or pull requests'}</p></section>
            </aside>
          </div>
        </main>
        <section className={`gh-panel sc-zone ${mark('pane')}`} aria-label={g.panel ?? 'Copilot'}>
          <header><img src="logo/ghcp/copilot.svg" alt="" /><b>{g.panel ?? 'Copilot'}</b>{oi('link-external')}{oi('close')}</header>
          <div className="gh-panel-stream sc-stream-in" ref={streamRef}>{children}</div>
        </section>
      </div>
      {dialogOpen && g.dialog && (
        <div className="gh-dialog-back">
          <div className="gh-dialog" role="dialog" aria-label="Assign to Copilot">
            <header><b>Assign to Copilot</b>{oi('close')}</header>
            <label>Optional prompt<p className="gh-input is-area">{g.dialog.prompt}</p></label>
            <div className="gh-dialog-grid">
              <label>Repository<p className="gh-input">{oi('repo')}{g.repo}</p></label>
              <label>Base branch<p className="gh-input">{oi('git-branch')}{g.dialog.base ?? 'main'}</p></label>
              <label>Custom agent<p className="gh-input">{g.dialog.agent ?? 'Copilot'}</p></label>
              <label>Model<p className="gh-input">{g.dialog.model ?? 'Auto'}</p></label>
            </div>
            <footer>
              <span className="gh-btn">Cancel</span>
              {hot('assign-go')
                ? <button type="button" className="gh-btn is-primary is-hunt" data-act="assign-go" onClick={onAct}>Assign</button>
                : <span className="gh-btn is-primary">Assign</span>}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function Event({ e, hot, onAct }: { e: GhEvent; hot: (x: string) => boolean; onAct: () => void }) {
  if (e.kind === 'comment' || e.kind === 'review') {
    return (
      <article className={`gh-comment${e.kind === 'review' ? ' is-review' : ''}`}>
        <Avatar who={e.who} bot={e.bot} />
        <div className="gh-comment-box">
          <header><b>{e.who}</b>{e.bot && <span className="gh-bot">bot</span>} {e.text}{e.at && <time>{e.at}</time>}</header>
          {e.file && (
            <p className="gh-file">{oi('file-code')}<code>{e.file}</code>{e.line && <span>line {e.line}</span>}{e.severity && <em className={`is-${e.severity.toLowerCase()}`}>{e.severity}</em>}</p>
          )}
          {e.body && <div className="gh-md">{e.body.map((b, i) => <p key={i}><Bold text={b} /></p>)}</div>}
          {e.suggestion && (
            <div className="gh-suggestion">
              <p className="gh-suggestion-h">Suggested change</p>
              {e.suggestion.del.map((l, i) => <pre key={`d${i}`} className="is-del">- {l}</pre>)}
              {e.suggestion.add.map((l, i) => <pre key={`a${i}`} className="is-add">+ {l}</pre>)}
            </div>
          )}
          {e.act && (hot(e.act.id)
            ? <p className="gh-acts"><button type="button" className="gh-btn is-hunt" data-act={e.act.id} onClick={onAct}>{e.act.label}</button></p>
            : <p className="gh-acts"><span className="gh-btn">{e.act.label}</span></p>)}
        </div>
      </article>
    );
  }
  const icon = { event: 'person', commit: 'git-commit', 'pr-link': 'git-pull-request', check: 'check' }[e.kind] ?? 'circle-small';
  return (
    <p className={`gh-event is-${e.kind}`}>
      <span className="gh-event-ico">{oi(icon)}</span>
      {e.bot ? <Avatar who={e.who} bot /> : null}<b>{e.who}</b> <Bold text={e.text} />{e.at && <time>{e.at}</time>}
    </p>
  );
}

function MergeBox({ g, ids, state, hot, onAct }: { g: GhPage; ids: string[]; state: string; hot: (x: string) => boolean; onAct: () => void }) {
  const checks = (g.checks ?? []).filter(c => passes(ids, c));
  const failing = checks.some(c => c.state === 'fail');
  if (state === 'merged') return <p className="gh-event is-merged"><span className="gh-event-ico">{oi('git-merge')}</span><b>me</b> merged commit into <code>{g.base ?? 'main'}</code></p>;
  return (
    <div className="gh-merge">
      <span className={`gh-merge-ico${failing ? ' is-fail' : ''}`}>{oi(failing ? 'x' : 'check')}</span>
      <div>
        <p className="gh-merge-h">{failing ? 'Some checks were not successful' : checks.length ? 'All checks have passed' : 'This branch has no conflicts with the base branch'}</p>
        {checks.map(c => <p key={c.name} className={`gh-check is-${c.state}`}>{oi(c.state === 'ok' ? 'pass-filled' : c.state === 'fail' ? 'error' : 'loading codicon-modifier-spin')}{c.name}</p>)}
        <p className="gh-merge-acts">
          {hot('merge')
            ? <button type="button" className="gh-btn is-merge is-hunt" data-act="merge" onClick={onAct}>Merge pull request</button>
            : <span className={`gh-btn is-merge${state === 'draft' ? ' is-off' : ''}`}>{state === 'draft' ? 'Ready for review' : 'Merge pull request'}</span>}
        </p>
      </div>
    </div>
  );
}

/** 결과 화면에서 GitHub 페이지를 정적으로 */
export function GhArtifact({ a, ids }: { a: Artifact; ids: string[] }) {
  const g = a.gh;
  if (!g) return null;
  return (
    <div className="gh gh-static">
      <main className="gh-page">
        <h1 className="gh-title">{g.title} <span>#{g.number}</span></h1>
        <div className="gh-timeline">{filterBy(g.events, ids).map((e, i) => <Event key={i} e={e} hot={() => false} onAct={() => {}} />)}</div>
      </main>
    </div>
  );
}
