import type { Scenario } from './types';
import { TRACK_IDS } from './tracks';

const modules = import.meta.glob<{ default: Scenario }>('./scenarios/*/*.scenario.json', { eager: true });

function load(): Scenario[] {
  const list: Scenario[] = [];
  const seen = new Set<string>();
  for (const [path, mod] of Object.entries(modules)) {
    const s = mod.default;
    const folder = path.split('/')[2];
    if (s.track && folder !== s.track) console.warn(`[scenarios] ${path} — 폴더는 ${folder} 인데 track 은 ${s.track} 입니다.`);
    if (!TRACK_IDS.includes(s.track)) { console.info(`[scenarios] 트랙에 없는 시나리오를 빼 둡니다: ${s.id}`); continue; }
    if (seen.has(s.id)) console.error(`[scenarios] 아이디가 겹칩니다: ${s.id}`);
    seen.add(s.id);
    list.push(s);
  }
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title, 'ko'));
}

export const SCENARIOS: Scenario[] = load();
export const scenariosOf = (track: string) => SCENARIOS.filter(s => s.track === track);
export const scenarioById = (id: string) => SCENARIOS.find(s => s.id === id);
export function countByTrack(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of TRACK_IDS) out[t] = 0;
  for (const s of SCENARIOS) out[s.track] = (out[s.track] ?? 0) + 1;
  return out;
}

/* ---------- 제품 이름 ---------- */
export const AGENTS = {
  vscode: { name: 'GitHub Copilot', full: 'VS Code의 GitHub Copilot' },
  github: { name: 'GitHub Copilot', full: 'GitHub.com의 GitHub Copilot' },
} as const;

/** 화면에 보일 제품 이름 */
export const productName = (s: Scenario) => AGENTS[s.agent].full;
