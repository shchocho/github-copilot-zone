import { go, HASH_HOME } from '../router';
import { COPY } from '../copy';
import { Lockup } from './Lobby';

/** 대기 화면 오른쪽의 편집기 미리보기 — 회색 제안이 떴다가 Tab 으로 받아들여지는 모습을 되풀이한다(실제 화면 모양, 장식 그림 아님) */
const PREVIEW: { t: string; g?: boolean }[] = [
  { t: '// 센서별 최근 1시간 평균 온도를 구한다' },
  { t: 'export function averageBySensor(readings: Reading[]) {' },
  { t: '  const groups = new Map<string, number[]>();', g: true },
  { t: '  for (const r of readings) {', g: true },
  { t: '    groups.set(r.sensorId, [...(groups.get(r.sensorId) ?? []), r.value]);', g: true },
  { t: '  }', g: true },
  { t: '  return [...groups].map(([id, v]) => ({ id, avg: mean(v) }));', g: true },
  { t: '}' },
];

/** 대기(어트랙트) 화면 — 화면 아무 곳이나 누르면 홈으로 */
export function Attract({ limited = false }: { limited?: boolean }) {
  return (
    <main className={`lobby ghcp-attract${limited ? ' is-limited' : ''}`} onClick={limited ? undefined : () => go(HASH_HOME)}>
      <div className="ghcp-attract-say">
        <Lockup />
        {limited ? (
          <>
            <h1>더 큰 화면에서<br />접속해 주세요</h1>
            <p>PC나 태블릿에서 체험해 주세요.<br />창을 작게 열었다면 크기를 늘려 주세요.</p>
          </>
        ) : (
          <>
            <h1>GitHub Copilot{COPY.particle} 함께라면,<br /><span>{COPY.tagline}</span></h1>
            <p>{COPY.homeSub}</p>
            <button type="button" className="ghcp-cta">체험해보기</button>
          </>
        )}
      </div>
      {!limited && (
        <figure className="ghcp-preview" aria-hidden="true">
          <figcaption><i className="codicon codicon-vscode" />sensor-hub — aggregate.ts</figcaption>
          <div className="ghcp-preview-code">
            {PREVIEW.map((l, i) => (
              <p key={i} className={l.g ? 'is-ghost' : undefined} style={{ '--i': i } as React.CSSProperties}>
                <span>{i + 18}</span><code>{l.t}</code>
              </p>
            ))}
          </div>
          <p className="ghcp-preview-note">회색 글자가 Copilot의 제안입니다. <kbd>Tab</kbd> 키로 받아들입니다.</p>
        </figure>
      )}
    </main>
  );
}
