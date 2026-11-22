/** 재생 화면의 단계별 화면: 상황(장면) · 흐름(개요) · 결과 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRightRegular, Dismiss20Regular, QrCode24Regular } from '@fluentui/react-icons';
import type { Artifact, OverviewStep, PlayState, Scenario, Scene, Vars } from '../types';
import { productName } from '../data';
import { SemIcon } from '../components/Icons';
import { ArtifactView, DocTabs, DocWindow } from '../components/artifacts';
import { artifactName, fill, pickIds } from '../engine/text';
import { SCENE_ART_DEV, fillArt } from './sceneArtDev';
import { COPY } from '../copy';

const POINT_GAP = 900 + 320;
const BG_SHAPES = new Set(['rect', 'path', 'ellipse', 'circle', 'polygon']);

/** 상황: 그림 + 고민 포인트가 하나씩 나타남. 아무 곳이나 누르면 다음 단계 */
export function SceneStage({ scene, onNext, cta = 'Copilot과 해보기' }: { scene: Scene; onNext: () => void; cta?: string }) {
  const [shown, setShown] = useState(0);
  const art = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (shown >= scene.points.length) return;
    const t = window.setTimeout(() => setShown(n => n + 1), POINT_GAP);
    return () => window.clearTimeout(t);
  }, [shown, scene.points.length]);
  const tpl = scene.art ? SCENE_ART_DEV[scene.art] : undefined;
  const svg = tpl ? fillArt(tpl, scene.artSlots) : undefined;
  // 템플릿의 꽉 찬 배경 도형을 숨겨 페이지 배경이 비치게 한다
  useLayoutEffect(() => {
    const el = art.current?.querySelector('svg');
    if (!el) return;
    const w = el.viewBox.baseVal?.width || 800;
    for (const c of Array.from(el.children)) {
      if (!BG_SHAPES.has(c.tagName) || c.getAttribute('fill') === 'none') continue;
      if ((c as SVGGraphicsElement).getBBox().width >= w * 0.98) (c as SVGElement).style.display = 'none';
    }
  }, [svg]);
  const parts = scene.headline.split(/‹‹|››/);
  return (
    <div className="sc-scene" onClick={onNext}>
      {svg && <span className="sc-illus" aria-hidden="true" ref={art} dangerouslySetInnerHTML={{ __html: svg }} />}
      <span className="sc-scene-head">
        <strong>{parts.map((t, i) => (i % 2 ? <mark key={i}>{t}</mark> : <span key={i}>{t}</span>))}</strong>
      </span>
      <ul className="sc-scene-grid">
        {scene.points.map((pt, i) => (
          <li key={i} className={i < shown ? 'is-in' : ''}>
            <i className="sc-scene-ico" aria-hidden="true"><SemIcon name={pt.icon ?? 'alert'} /></i>
            <b className="sc-scene-name">{pt.scene}</b>
            <q>{pt.say}</q>
          </li>
        ))}
      </ul>
      <span className="sc-scene-outro" style={{ '--outro-in': `${scene.points.length * POINT_GAP}ms` } as React.CSSProperties}>
        <button type="button" className="sc-start">{cta}<ArrowRightRegular aria-hidden="true" /></button>
      </span>
    </div>
  );
}

/** 장면 데이터가 없을 때의 대체 화면 */
export function PainStage({ title, caption, onNext }: { title: string; caption: string; onNext: () => void }) {
  return (
    <button type="button" className="sc-pain" aria-label="다음으로" onClick={onNext}>
      <span className="sc-pain-hold" aria-hidden="true">🗂️</span>
      <span className="sc-pain-say"><em>{title}</em><strong>{caption}</strong><i>화면을 눌러 다음으로</i></span>
    </button>
  );
}

/** 제품 이름 뒤 조사(과/와): 마지막 글자가 받침 있는 한글이거나 자음으로 끝나는 영어(GitHub Copilot · Chat)면 '과' */
export function withParticle(word: string) {
  const c = word.trim().slice(-1);
  const code = c.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 ? '과' : '와';
  return /[aeiouy]/i.test(c) ? '와' : '과';
}

/** 결과물 표시(탭 · 제목 앞): 코드 파일 · 터미널 · GitHub 페이지를 Codicons 로 구분한다 */
function ArtifactMark({ a }: { a: Pick<Artifact, 'kind'> & { app?: string } }) {
  const name = a.kind === 'term' ? 'terminal' : a.kind === 'gh' || a.app === 'github' ? 'git-pull-request' : 'file-code';
  return <i className={`sc-art-mark codicon codicon-${name}`} aria-hidden="true" />;
}

export function ProductName({ product }: { product: string }) {
  return (
    <span className="sc-overview-product-name">
      <span className="sc-overview-product-suffix">{product}</span>
    </span>
  );
}

/** 흐름: 단계 카드를 눌러 하나씩 연 뒤 "지금 시작하기" */
export function OverviewStage({ product, steps, hook, onNext }: { product: string; steps: OverviewStep[]; hook?: string; onNext: () => void }) {
  const [shown, setShown] = useState(0);
  const all = shown >= steps.length;
  const more = () => setShown(n => Math.min(n + 1, steps.length));
  return (
    <div className="sc-stage sc-stage-sky">
      <div className="sc-stage-head">
        <h2>
          <span className="sc-overview-product-name">
            <span className="sc-overview-product-suffix">{product}</span>
            <span className="sc-overview-product-particle">{withParticle(product)}</span>
          </span>{' '}함께라면?
        </h2>
        {hook && <span className="sc-hook">{hook}</span>}
      </div>
      <ol className={`sc-flow${all ? '' : ' is-tappable'}`} style={{ '--shown': shown, '--n': steps.length } as React.CSSProperties} onClick={all ? undefined : more}>
        {steps.map((s, i) => (
          <li key={i} className={`sc-flow-step${i < shown ? ' is-in' : ''}${i === shown ? ' is-next' : ''}`}>
            <span className="sc-flow-no">{i + 1}</span>
            <span className="sc-flow-body"><strong>{s.title}</strong><p>{s.desc}</p></span>
          </li>
        ))}
      </ol>
      <div className={`sc-outro${all ? ' is-done' : ''}`}>
        {all ? (
          <>
            <p className="sc-ready">직접 해 볼까요?</p>
            <button type="button" className="sc-start" onClick={onNext}>지금 시작하기</button>
          </>
        ) : (
          <button type="button" className="sc-flow-more" onClick={more}>
            <i />{shown === 0 ? '칸을 눌러 하나씩 열어보세요' : `다음 칸을 눌러 보세요 (${shown} / ${steps.length})`}
          </button>
        )}
      </div>
    </div>
  );
}

/** 결과 화면의 QR 안내 (이미지가 있을 때만) */
function QrButton() {
  const [ok, setOk] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!COPY.qr.src) return;
    const img = new Image();
    img.onload = () => setOk(true);
    img.src = COPY.qr.src;
  }, []);
  if (!ok) return null;
  return (
    <>
      <button type="button" className="sc-done-qr-btn" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        <QrCode24Regular />{COPY.qr.label} QR 확인
      </button>
      <dialog ref={dialog} className="sc-qr-dialog" aria-label={`${COPY.qr.label} QR 코드`} onClick={e => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <div>
          <button type="button" className="sc-qr-close" aria-label="닫기" onClick={() => dialog.current?.close()}><Dismiss20Regular /></button>
          <h2>{COPY.qr.label}</h2>
          <img src={COPY.qr.src} alt="" />
        </div>
      </dialog>
    </>
  );
}

/** 결과: 만든 결과물 + 요약 */
export function DoneStage({ s, st, vars, completed }: { s: Scenario; st: PlayState; vars: Vars; completed: boolean }) {
  const ids = pickIds(st);
  const arts = s.workbench?.artifacts ?? {};
  const openedMade = st.opened.map(id => ({ id, a: arts[id] })).filter(x => x.a?.origin === 'made');
  const made = openedMade.length ? openedMade : Object.entries(arts).filter(([, a]) => a.origin === 'made').map(([id, a]) => ({ id, a }));
  const outsKey = Object.keys(s.finish?.outsBy ?? {}).find(k => ids.includes(k));
  const outs = (outsKey ? s.finish?.outsBy?.[outsKey] : undefined) ?? s.finish?.outs ?? [];
  const talk = !made.length && outs.length > 0;
  const [cur, setCur] = useState(made[0]?.id ?? null);
  const current = made.find(m => m.id === cur) ?? made[0];
  const product = productName(s);
  const madeLabel = '체험 결과';
  return (
    <div className={`sc-done sc-stage-sky${made.length || talk ? ' is-split' : ''}`}>
      {current && (
        <section className="sc-done-doc" aria-label="생성된 결과물">
          <DocWindow
            app={current.a.app}
            note={current.a.note}
            {...(made.length === 1
              ? { mark: <ArtifactMark a={current.a} />, name: artifactName(current.a, ids), badge: madeLabel }
              : { tabs: <DocTabs tabs={made.map(m => ({ id: m.id, name: artifactName(m.a, ids), mark: <ArtifactMark a={m.a} />, on: m.id === current.id }))} onPick={setCur} /> })}
          >
            <ArtifactView a={current.a} ids={ids} />
          </DocWindow>
        </section>
      )}
      {talk && (
        <section className="sc-done-doc is-talk">
          <u>생성된 결과물</u>
          <ul className="sc-outs">{outs.map((o, i) => <li key={i}><ArtifactMark a={{ kind: 'code', app: o.app }} /><b>{o.name}</b></li>)}</ul>
        </section>
      )}
      <div className="sc-done-side">
        <div className="sc-done-head">
          <h2>
            {completed
              ? <><ProductName product={product} /><span>{withParticle(product)} 함께</span></>
              : <><ProductName product={product} /><span>체험 미완료</span></>}
          </h2>
          <p>{completed ? s.finish?.sub ?? s.hook ?? s.summary : '체험을 끝까지 진행하지 않았습니다.'}</p>
        </div>
        <div className="sc-done-grid">
          {completed && !!s.recap?.length && (
            <section className="sc-done-sec is-quiet">
              <ul className="sc-recap">
                {s.recap.map((r, i) => (
                  <li key={i}>
                    <span className="sc-recap-icon" aria-hidden="true"><SemIcon name={r.icon} /></span>
                    <div><strong>{r.name}</strong><p>{fill(r.desc, vars)}</p></div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {completed && <QrButton />}
      </div>
    </div>
  );
}
