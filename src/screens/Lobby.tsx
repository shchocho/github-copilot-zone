import { COPY } from '../copy';

/** 대기 · 홈 · 목록 화면이 함께 쓰는 조각 */

/** 체험 존 이름표 — 자체 아이콘(public/favicon.svg) + 체험 존 이름 + '교육용 시뮬레이터' 표기. 공식 로고는 쓰지 않는다. */
export function Lockup() {
  return (
    <p className="lobby-lockup">
      <img src="favicon.svg" alt="" width={28} height={28} />
      <b>{COPY.zoneName}</b>
      <span>{COPY.zoneTag}</span>
    </p>
  );
}

/** 트랙 · 시나리오의 제품 이름 (tracks.ts 의 products, 시나리오의 agent) */
export const PRODUCT_LABEL: Record<string, string> = { vscode: 'VS Code', github: 'GitHub.com' };

/** 홈 · 목록 아래 안내 — 공식 사이트가 아님 · 가상의 데이터 */
export function LobbyFoot() {
  return (
    <footer className="lobby-foot">
      <span>{COPY.footerLeft}</span>
      <span>{COPY.disclaimer}</span>
    </footer>
  );
}
