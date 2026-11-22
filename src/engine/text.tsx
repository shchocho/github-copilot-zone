import type { Artifact, Filterable, PlayState, Vars } from '../types';

/** {model} {pick:KEY} {val:KEY} 치환 */
export function fill(text: string, v: Vars): string {
  return text
    .replace(/\{model\}/g, v.model)
    .replace(/\{pick:([^}]+)\}/g, (m, k: string) => v.picks[k] ?? m)
    .replace(/\{val:([^}]+)\}/g, (m, k: string) => v.vals[k] ?? m);
}

/** 고른 선택지 id 목록 + 도구가 켠 깃발 */
export const pickIds = (st: PlayState) => [...st.picks.map(p => p.option.id), ...st.flags];

export function passes(ids: string[], item?: Filterable | null): boolean {
  if (!item) return true;
  if (item.only && !item.only.some(id => ids.includes(id))) return false;
  if (item.not && item.not.some(id => ids.includes(id))) return false;
  return true;
}
export const filterBy = <T extends Filterable>(list: T[], ids: string[]) => list.filter(x => passes(ids, x));

export function makeVars(st: PlayState, model: string): Vars {
  return {
    model,
    picks: Object.fromEntries(st.picks.map(p => [p.key, p.option.label])),
    vals: Object.fromEntries(st.picks.filter(p => p.option.value).map(p => [p.key, p.option.value as string])),
  };
}

/** 결과물 표시 이름 (선택에 따라 달라지는 nameBy) */
export function artifactName(a: Artifact, ids: string[]): string {
  if (!a.nameBy) return a.name;
  for (const id of ids) if (a.nameBy[id]) return a.nameBy[id];
  return a.name;
}

/** 작성 애니메이션 길이(줄 수): 코드 · 터미널만 한 줄씩 써 내려간다 */
export function writeLength(a: Artifact, ids: string[]): number {
  if (a.kind === 'code') return a.code ? filterBy(a.code.lines, ids).length : 0;
  if (a.kind === 'term') return a.term ? filterBy(a.term.lines, ids).length : 0;
  return 0;
}

/** **굵게** · `코드` */
export function Bold({ text }: { text: string }) {
  const code = (t: string, k: number) => (t.includes('`')
    ? <span key={k}>{t.split(/(`[^`]+`)/).map((x, j) => (x.startsWith('`') && x.endsWith('`') && x.length > 1 ? <code key={j} className="sc-ic">{x.slice(1, -1)}</code> : x))}</span>
    : <span key={k}>{t}</span>);
  return <>{text.split(/\*\*/).map((t, i) => (i % 2 ? <b key={i}>{t}</b> : code(t, i)))}</>;
}

type Block = { kind: 'p' | 'code' | 'quote'; lines: string[] } | { kind: 'check'; items: string[] };
function parseBlocks(text: string): Block[] {
  const out: Block[] = [];
  const lines = text.split('\n');
  const para: string[] = [];
  const flush = () => { if (para.length) out.push({ kind: 'p', lines: [...para] }); para.length = 0; };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (line.trim().startsWith('```')) {
      flush();
      const code: string[] = [];
      for (i++; i < lines.length && !(lines[i] ?? '').trim().startsWith('```'); i++) code.push(lines[i] ?? '');
      i++;
      out.push({ kind: 'code', lines: code });
      continue;
    }
    if (line.startsWith('>')) {
      flush();
      const q: string[] = [];
      for (; i < lines.length && (lines[i] ?? '').startsWith('>'); i++) q.push((lines[i] ?? '').replace(/^>\s?/, ''));
      out.push({ kind: 'quote', lines: q });
      continue;
    }
    if (line.startsWith('✅ ')) {
      flush();
      const items: string[] = [];
      for (; i < lines.length && (lines[i] ?? '').startsWith('✅ '); i++) items.push((lines[i] ?? '').slice(2).trim());
      out.push({ kind: 'check', items });
      continue;
    }
    if (line.trim() === '') { flush(); i++; continue; }
    para.push(line);
    i++;
  }
  flush();
  return out;
}

/** 답변 본문: 문단 · ✅ 체크 목록 · > 인용 · ``` 코드 */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {parseBlocks(text).map((b, i) =>
        b.kind === 'quote' ? <blockquote key={i} className="sc-quote">{b.lines.join('\n')}</blockquote>
        : b.kind === 'code' ? <div key={i} className="sc-code">{b.lines.map((l, j) => <span key={j}><i>{j + 1}</i>{l}</span>)}</div>
        : b.kind === 'check' ? <ul key={i} className="sc-check">{b.items.map((t, j) => <li key={j}><span><Bold text={t} /></span></li>)}</ul>
        : <p key={i}><Bold text={b.lines.join('\n')} /></p>,
      )}
    </>
  );
}
