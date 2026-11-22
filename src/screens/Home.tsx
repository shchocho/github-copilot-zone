import { TRACKS } from '../tracks';
import { countByTrack } from '../data';
import { go, hashTrack } from '../router';
import { TrackIcon } from '../components/Icons';
import { COPY } from '../copy';
import { Lockup, LobbyFoot, PRODUCT_LABEL } from './Lobby';

/** 홈(#/start) — 체험할 기능(트랙) 고르기. 왼쪽에서 오른쪽으로 갈수록 Copilot이 맡는 범위가 넓어지는 순서다. */
export function Home() {
  const counts = countByTrack();
  return (
    <main className="lobby lobby-home">
      <header className="lobby-top"><Lockup /></header>
      <div className="lobby-head">
        <h1>GitHub Copilot{COPY.particle} 함께라면,<br /><span>{COPY.tagline}</span></h1>
        <p>{COPY.homeLead} {COPY.homeSub}</p>
      </div>
      <section className="lobby-tracks" aria-label={COPY.groupWork}>
        <p className="lobby-scale" aria-hidden="true">
          <span>{COPY.scaleFrom}</span><i /><span>{COPY.scaleTo}</span>
        </p>
        <ol className="lobby-track-row">
          {TRACKS.map((t, i) => {
            const n = counts[t.id] ?? 0;
            const product = t.products?.[0] ?? 'vscode';
            return (
              <li key={t.id}>
                <button type="button" className="lobby-track" data-track={t.id} disabled={!n} onClick={() => go(hashTrack(t.id))}>
                  <span className="lobby-track-top">
                    <span className="lobby-track-icon"><TrackIcon id={t.id} fallback={t.icon} /></span>
                    <span className="lobby-track-no">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <strong>{t.name}</strong>
                  <span className="lobby-track-about">{t.about}</span>
                  <span className="lobby-track-foot">
                    <span><i className={`codicon codicon-${product}`} aria-hidden="true" />{PRODUCT_LABEL[product] ?? product}</span>
                    <span>시나리오 {n}편<i className="codicon codicon-arrow-right" aria-hidden="true" /></span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
      <LobbyFoot />
    </main>
  );
}
