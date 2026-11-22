import { scenariosOf } from '../data';
import { trackById } from '../tracks';
import { go, HASH_HOME, hashPlay } from '../router';
import { TrackIcon } from '../components/Icons';
import { COPY } from '../copy';
import { Lockup, LobbyFoot, PRODUCT_LABEL } from './Lobby';

/** 시나리오 목록(#/t/<영역>) — 영역의 시나리오 2~3편을 한 화면에 나란히 둔다(넘기는 목록 없이 한눈에 비교) */
export function ScenarioList({ track }: { track: string }) {
  const t = trackById(track);
  const list = scenariosOf(track);
  if (!t) return null; // 주소의 영역 이름은 router.ts 가 이미 걸러 낸다
  return (
    <main className="lobby lobby-list" data-track={t.id}>
      <header className="lobby-top"><Lockup /></header>
      <div className="lobby-head">
        <button type="button" className="lobby-back" onClick={() => go(HASH_HOME)}>
          <i className="codicon codicon-arrow-left" aria-hidden="true" />{COPY.backToHome}
        </button>
        <h1 className="lobby-title"><span className="lobby-track-icon"><TrackIcon id={t.id} fallback={t.icon} /></span>{t.name}</h1>
        <p>{t.about}</p>
      </div>
      <ul className="lobby-scenarios" data-n={Math.min(list.length, 3)}>
        {list.map(s => (
          <li key={s.id}>
            <article className="lobby-scenario">
              <span className="lobby-chip"><i className={`codicon codicon-${s.agent}`} aria-hidden="true" />{PRODUCT_LABEL[s.agent] ?? s.agent}</span>
              <h2>{s.title}</h2>
              <dl className="lobby-compare">
                {s.before && <div><dt>지금은</dt><dd>{s.before}</dd></div>}
                {s.hook && <div><dt>Copilot과 함께라면</dt><dd>{s.hook}</dd></div>}
              </dl>
              <div className="lobby-scenario-foot">
                <span>{s.overview?.length ? `흐름 ${s.overview.length}단계` : ''}</span>
                <button type="button" className="lobby-go" onClick={() => go(hashPlay(t.id, s.id))} aria-label={`${s.title} 체험해보기`}>
                  체험해보기<i className="codicon codicon-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <LobbyFoot />
    </main>
  );
}
