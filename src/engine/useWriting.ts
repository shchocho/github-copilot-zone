import { useEffect } from 'react';
import type { PlayState, Scenario } from '../types';
import { passes, writeLength } from './text';

const CODE_MS = 120; // 코드와 터미널은 한 줄씩 빠르게 써 내려간다

/**
 * 도구 메시지의 효과: 결과물 열기(opens) · 한 줄씩 작성(writes) · 깃발 켜기(sets).
 * s 가 없으면 아무것도 하지 않는다.
 */
export function useWriting(
  s: Scenario | undefined, active: boolean, shown: number, st: PlayState,
  setSt: React.Dispatch<React.SetStateAction<PlayState>>, ids: string[],
) {
  useEffect(() => {
    const m = s?.messages[shown - 1];
    if (!m || !passes(ids, m) || m.role !== 'tool') return;
    const open = m.opens;
    if (open) setSt(x => ({ ...x, opened: x.opened.includes(open) ? x.opened : [...x.opened, open] }));
    if (m.writes) {
      const w = m.writes;
      setSt(x => ({ ...x, opened: x.opened.includes(w) ? x.opened : [...x.opened, w], writing: w, rows: 0 }));
    }
    if (m.sets) { const f = m.sets; setSt(x => (x.flags.includes(f) ? x : { ...x, flags: [...x.flags, f] })); }
  }, [shown, s, st.picks.length, setSt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const id = st.writing;
    if (!active || !id) return;
    const a = s?.workbench?.artifacts[id];
    if (!a) return;
    if (st.rows >= writeLength(a, ids)) { setSt(x => ({ ...x, writing: null })); return; }
    const t = window.setTimeout(() => setSt(x => ({ ...x, rows: x.rows + 1 })), CODE_MS);
    return () => window.clearTimeout(t);
  }, [active, s, st.writing, st.rows, st.picks.length, setSt]); // eslint-disable-line react-hooks/exhaustive-deps
}
