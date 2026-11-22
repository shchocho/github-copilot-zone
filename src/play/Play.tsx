/** 시나리오 재생 화면: 상황 → 흐름 → 체험(VS Code · GitHub.com) → 결과 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowCounterclockwiseRegular, ArrowLeftRegular, ArrowPreviousRegular, HomeRegular, NextRegular,
} from '@fluentui/react-icons';
import { INITIAL_STATE, type ChoiceOption, type Message, type MsgChoice, type PlayState } from '../types';
import { AGENTS, productName, scenarioById } from '../data';
import { trackById } from '../tracks';
import { go, HASH_ATTRACT, hashTrack } from '../router';
import { useEngine } from '../engine/useEngine';
import { useWriting } from '../engine/useWriting';
import { fill, makeVars, passes, pickIds } from '../engine/text';
import { MessageView } from '../components/messages';
import { Bubble, CueButton, Hint, Key, Options, Tip, TipLayer } from '../components/coach';
import { scrollToBottom, scrollToHold, type Mark } from '../components/stream';
import { WE } from '../components/ui';
import { VsCodeWindow, VsConfirm, VsStep, VsWorking } from '../surfaces/vscode/VsCode';
import { KEY_TARGETS } from '../surfaces/vscode/labels';
import { GitHubWeb } from '../surfaces/github/GitHubWeb';
import { DoneStage, OverviewStage, PainStage, SceneStage } from './Stages';

const LABEL: Record<string, string> = { pain: '상황', overview: '흐름', demo: '체험', done: '결과' };
const REWIND_MS = 1600;
const NO_MESSAGES: Message[] = [];
/** 화면 영역 → class. 말풍선이 붙을 자리(.zone-composer 등) */
const mark: Mark = zone => `zone-${zone}`;
const toolView = (t: string, a: boolean) => <VsStep text={t} active={a} />;

export function Play({ track, scenario }: { track: string; scenario: string }) {
  const s = scenarioById(scenario);
  const t = trackById(track);
  const [st, setSt] = useState<PlayState>(INITIAL_STATE);
  const ids = pickIds(st);
  const p = useEngine(s?.messages ?? NO_MESSAGES, m => !passes(ids, m));
  const [stepIdx, setStepIdx] = useState(0);
  const [rewind, setRewind] = useState(0);
  const [deniedAt, setDeniedAt] = useState<number | null>(null);
  const [holdAt, setHoldAt] = useState<number | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  const steps = s ? ['pain', ...(s.overview?.length ? ['overview'] : []), 'demo', 'done'] : [];
  const step = steps[Math.min(stepIdx, steps.length - 1)] ?? 'demo';

  useEffect(() => {
    if (!rewind) return;
    const tm = window.setTimeout(() => setRewind(0), REWIND_MS);
    return () => window.clearTimeout(tm);
  }, [rewind]);
  useEffect(() => { if (step === 'demo') p.play(); else p.pause(); }, [step, p.play, p.pause]); // eslint-disable-line react-hooks/exhaustive-deps

  // 답변이 나오면 멈추고 "이어서 보기"
  useEffect(() => {
    if (step !== 'demo' || p.shown === 0) return;
    const m = s?.messages[p.shown - 1];
    if (m?.role === 'assistant' && passes(ids, m)) setHoldAt(p.shown - 1);
  }, [step, p.shown, s, ids.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (step === 'demo' && holdAt !== null) p.pause(); }, [step, holdAt, p.pause, p.playing]); // eslint-disable-line react-hooks/exhaustive-deps

  useWriting(s, step === 'demo', p.shown, st, setSt, ids);

  // 시나리오가 바뀌면 초기화
  const [seen, setSeen] = useState(scenario);
  if (seen !== scenario) {
    setSeen(scenario); setStepIdx(0); setHoldAt(null); setSt(INITIAL_STATE); setDeniedAt(null);
  }

  useEffect(() => { scrollToBottom(streamRef.current); }, [step, p.shown, p.done, p.pending, holdAt]);
  useEffect(() => scrollToHold(streamRef.current), [holdAt]);

  const next = useCallback(() => setStepIdx(i => Math.min(i + 1, steps.length - 1)), [steps.length]);

  if (!s) {
    return (
      <main className="sc">
        <p className="booth-empty">시나리오를 찾을 수 없습니다.</p>
        <button type="button" className="booth-back" onClick={() => go(hashTrack(track))}><ArrowLeftRegular aria-hidden="true" />목록으로</button>
      </main>
    );
  }

  const vars = makeVars(st, s.model);
  const resetAll = () => {
    setHoldAt(null); setSt(INITIAL_STATE); setDeniedAt(null);
    p.restart();
  };
  const canBack = (step === 'demo' && p.canBack) || stepIdx > 0;
  const back = () => {
    setHoldAt(null); setDeniedAt(null);
    if (step === 'demo' && p.canBack) { setRewind(Date.now()); p.back(); return; }
    p.pause();
    setStepIdx(i => Math.max(i - 1, 0));
  };
  const isLast = stepIdx === steps.length - 1;
  /** 선택지를 고르면 바로 다음으로 (되돌아와 다시 고르면 앞선 선택을 바꾼다) */
  const choose = (c: MsgChoice, o: ChoiceOption) => {
    setSt(x => ({
      ...x,
      picks: [...x.picks.filter(q => q.key !== c.key), { key: c.key, option: o }],
      ...(c.builds ? { opened: x.opened.includes(c.builds) ? x.opened : [...x.opened, c.builds], writing: c.builds, rows: 0 } : {}),
    }));
    p.act();
  };
  const ask = p.ask ? fill(p.ask, vars) : null;
  const onSend = holdAt === null && p.pending ? p.act : undefined;
  const target = holdAt === null ? p.pending?.target : undefined;
  const stream = (
    <>
      {s.startedAt && <p className="sc-date">{s.startedAt}</p>}
      {s.messages.slice(0, p.shown).map((m, i) => (!passes(ids, m) || (m.role === 'tool' && m.quiet) ? null : m.role === 'choice' ? (
        <div key={i} className="sc-user"><div className="sc-user-box"><p>{(o => o?.say ?? o?.label)(st.picks.find(x => x.key === m.key)?.option)}</p></div></div>
      ) : (
        <MessageView
          key={i}
          m={m.role === 'assistant' || m.role === 'user' ? { ...m, text: fill(m.text, vars) } : m}
          active={i === p.shown - 1 && p.playing}
          ids={ids}
          hold={i === holdAt}
          toolView={toolView}
        />
      )))}
      {holdAt === null && p.approve && (
        <VsConfirm key={p.shown} a={p.approve} denied={deniedAt === p.shown} onAllow={p.act} onDeny={() => setDeniedAt(p.shown)} onBack={() => setDeniedAt(null)} />
      )}
      {p.busy && <VsWorking />}
    </>
  );

  return (
    <main className="sc" data-track={track} data-scenario={scenario} data-brand-theme="copilot">
      <header className="sc-head">
        <button type="button" className="sc-back" aria-label={`${t?.name ?? '목록'} 목록으로 돌아가기`} onClick={() => go(hashTrack(track))}>
          <ArrowLeftRegular aria-hidden="true" />
        </button>
        <div className="sc-jump">
          <button type="button" className="sc-ghost" onClick={() => { resetAll(); setStepIdx(0); }}><ArrowCounterclockwiseRegular aria-hidden="true" />처음으로</button>
          <button type="button" className="sc-ghost" onClick={back} disabled={!canBack}><ArrowPreviousRegular aria-hidden="true" />이전으로</button>
          {isLast
            ? <button type="button" className="sc-ghost" onClick={() => { p.pause(); go(HASH_ATTRACT); }}><HomeRegular aria-hidden="true" />홈으로</button>
            : <button type="button" className="sc-ghost" onClick={() => { p.pause(); setStepIdx(steps.length - 1); }}>건너뛰기<NextRegular aria-hidden="true" /></button>}
        </div>
        <div className="sc-title"><h1>{s.title}</h1></div>
      </header>
      <ol className="sc-steps" aria-label="진행 단계" style={{ '--n': steps.length, '--i': stepIdx } as React.CSSProperties}>
        {steps.map((k, i) => (
          <li key={k} className={i === stepIdx ? 'on' : i < stepIdx ? 'past' : ''} {...(i === stepIdx ? { 'aria-current': 'step' as const } : {})}>
            {i < stepIdx
              ? <button type="button" aria-label={`${LABEL[k]} 단계로 돌아가기`} onClick={() => setStepIdx(i)}>{LABEL[k]}</button>
              : <span>{LABEL[k]}</span>}
          </li>
        ))}
      </ol>

      {step === 'pain' && (s.scene
        ? <SceneStage scene={s.scene} onNext={next} />
        : <PainStage title={s.title} caption={s.before ?? s.summary} onNext={next} />)}
      {step === 'overview' && <OverviewStage product={productName(s)} steps={s.overview ?? []} hook={s.hook} onNext={next} />}
      {step === 'done' && <DoneStage s={s} st={st} vars={vars} completed={p.done} />}

      {step === 'demo' && (
        <div className="sc-feed">
          <div className="desk-win is-app">
            {s.agent === 'vscode' ? (
              <VsCodeWindow
                s={s} st={st} ids={ids} mark={mark} streamRef={streamRef}
                ask={ask} onSend={ask ? onSend : undefined}
                target={target} onAct={p.act}
              >
                {stream}
              </VsCodeWindow>
            ) : (
              <GitHubWeb s={s} st={st} ids={ids} mark={mark} streamRef={streamRef} target={target} onAct={p.act}>
                {stream}
              </GitHubWeb>
            )}
            <TipLayer>
              {holdAt !== null && (
                <Tip zone=".cwr-hold">
                  <Bubble q={`${AGENTS[s.agent].name}의 답변입니다.\n내용을 확인한 뒤 이어서 진행해 주세요.`}>
                    <CueButton next onClick={() => { setHoldAt(null); p.play(); }}>이어서 보기</CueButton>
                  </Bubble>
                </Tip>
              )}
              {holdAt === null && p.approve && (
                <Tip zone=".wb-perm"><Bubble q={`실행하기 전에 사람에게 한 번 확인합니다.\n확인하고 이상이 없다면 ${p.approve.go ?? '허용'}을 눌러주세요.`} /></Tip>
              )}
              {holdAt === null && p.choice && (
                <Tip>
                  <Bubble kind="choice" q={p.choice.text}>
                    <Options options={p.choice.options} onPick={o => p.choice && choose(p.choice, o as ChoiceOption)} />
                  </Bubble>
                </Tip>
              )}
              {holdAt === null && p.pending && (
                <Tip zone={p.pending.target ? `[data-act="${p.pending.target}"]` : '.zone-composer'}>
                  <Bubble q={p.pending.text}>
                    {p.pending.target && KEY_TARGETS[p.pending.target] ? <Hint>키보드에서 <Key>{KEY_TARGETS[p.pending.target].label}</Key>을 누르거나 화면의 <b>{p.pending.action}</b>을 눌러 보세요.</Hint>
                      : p.pending.target ? <Hint>화면에서 <b>{p.pending.action}</b> 단추를 눌러 보세요.</Hint>
                      : p.ask ? <Hint><Key>{WE.send}</Key>을 눌러 보내 보세요.</Hint>
                      : <CueButton onClick={p.act}>{p.pending.action}</CueButton>}
                  </Bubble>
                </Tip>
              )}
              {p.done && holdAt === null && (
                <Tip dim={false}>
                  <Bubble q="모든 작업이 완료되었습니다."><CueButton next onClick={next}>결과물 보기</CueButton></Bubble>
                </Tip>
              )}
            </TipLayer>
          </div>
        </div>
      )}
      {rewind > 0 && <p className="sc-rewind" role="status">한 걸음 되돌렸습니다</p>}
    </main>
  );
}
