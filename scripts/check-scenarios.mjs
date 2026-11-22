#!/usr/bin/env node
/**
 * 시나리오 JSON 검사기 — 새 시나리오를 추가하거나 고친 뒤 `npm run check:scenarios` 로 실행하세요.
 * 엔진이 기대하는 구조(역할별 필수 키, 결과물 참조, 선택지 id 등)를 확인합니다.
 * 화면은 VS Code(agent: vscode)와 GitHub.com(agent: github) 두 가지, 결과물은 code · term · gh 세 가지입니다.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/scenarios/', import.meta.url)); // .pathname 은 Windows 에서 경로가 깨짐
const TRACKS = ['completions', 'chat', 'agent', 'cloud'];
/** 재생 화면(agent)마다 surface 는 같은 이름이고, 그 화면의 결과물(app)이 하나 이상 있어야 한다 */
const AGENTS = ['vscode', 'github'];
const KINDS = ['code', 'term', 'gh'];
const ROLES = new Set(['user', 'assistant', 'tool', 'cue', 'approve', 'choice']);
const ICONS = new Set(['box', 'briefcase', 'chart', 'megaphone', 'people', 'code', 'clock', 'calx', 'scales', 'split', 'docsearch', 'calc', 'target', 'mail', 'share', 'checkdoc', 'factory', 'coin', 'network', 'alert', 'bolt', 'sliders', 'link', 'check', 'send', 'truck', 'refresh', 'gauge', 'shield']);
const BANNED = (process.env.BANNED ?? 'POSTECH,포스텍').split(',').filter(Boolean);

let problems = 0;
const ids = new Set();
const err = (file, msg) => { problems++; console.error(`✗ ${file}: ${msg}`); };

for (const track of readdirSync(ROOT)) {
  const dir = join(ROOT, track);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).filter(n => n.endsWith('.scenario.json'))) {
    const file = `${track}/${f}`;
    let s;
    try { s = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch (e) { err(file, `JSON 오류 — ${e.message}`); continue; }
    for (const k of ['id', 'track', 'agent', 'model', 'title', 'summary']) if (typeof s[k] !== 'string' || !s[k]) err(file, `${k} 가 비어 있습니다`);
    if (!TRACKS.includes(s.track)) err(file, `track "${s.track}" 은 tracks.ts 에 없습니다`);
    if (s.track !== track) err(file, `폴더(${track})와 track(${s.track})이 다릅니다`);
    if (basename(f, '.scenario.json') !== s.id) err(file, `파일 이름과 id(${s.id})가 다릅니다`);
    if (ids.has(s.id)) err(file, `id 중복: ${s.id}`);
    ids.add(s.id);
    if (!AGENTS.includes(s.agent)) err(file, `agent 는 ${AGENTS.join(' · ')} 중 하나여야 합니다`);
    else if (!(s.surface === s.agent && Object.values(s.workbench?.artifacts ?? {}).some(a => a.app === s.surface))) err(file, `${s.agent} 시나리오는 surface "${s.agent}" 와 그 화면의 결과물(app: ${s.agent})이 필요합니다`);
    if (!Array.isArray(s.messages) || !s.messages.length) { err(file, 'messages 가 비어 있습니다'); continue; }
    const arts = s.workbench?.artifacts ?? {};
    const optionIds = new Set();
    s.messages.forEach((m, i) => {
      const at = `messages[${i}] (${m.role})`;
      if (!ROLES.has(m.role)) return err(file, `${at}: 알 수 없는 role (${[...ROLES].join(' · ')} 중 하나)`);
      if (m.role === 'cue' && (!m.text || !m.action)) err(file, `${at}: text·action 이 필요합니다`);
      if (m.role === 'tool' && !m.tool) err(file, `${at}: tool 이 필요합니다`);
      if (m.role === 'tool' && m.sets) optionIds.add(m.sets);
      if (m.role === 'tool') for (const k of ['opens', 'writes']) if (m[k] && !arts[m[k]]) err(file, `${at}: ${k} "${m[k]}" 결과물이 없습니다`);
      if (['user', 'assistant'].includes(m.role) && typeof m.text !== 'string') err(file, `${at}: text 가 필요합니다`);
      if (m.role === 'approve' && !m.what) err(file, `${at}: what 이 필요합니다`);
      if (m.role === 'choice') {
        if (!m.key || !m.text) err(file, `${at}: key·text 가 필요합니다`);
        if (!Array.isArray(m.options) || m.options.length < 2) err(file, `${at}: 선택지가 2개 이상 필요합니다`);
        for (const o of m.options ?? []) { if (!o.id || !o.label) err(file, `${at}: 선택지마다 id·label 이 필요합니다`); optionIds.add(o.id); }
        if (m.builds && !arts[m.builds]) err(file, `${at}: builds "${m.builds}" 결과물이 없습니다`);
      }
    });
    // only/not 에 쓴 id 가 실제 선택지나 깃발(sets)에 있는지
    const check = (list, where) => { for (const x of list ?? []) if (!optionIds.has(x)) err(file, `${where}: only/not 의 "${x}" 는 어떤 선택지 id · 깃발도 아닙니다`); };
    s.messages.forEach((m, i) => { check(m.only, `messages[${i}]`); check(m.not, `messages[${i}]`); });
    for (const [k, a] of Object.entries(arts)) {
      if (!a.app || !a.kind || !a.origin || !a.name || typeof a.where !== 'string') err(file, `결과물 ${k}: app·kind·origin·name·where 가 필요합니다`);
      if (a.kind && !KINDS.includes(a.kind)) err(file, `결과물 ${k}: kind 는 ${KINDS.join(' · ')} 중 하나여야 합니다`);
      if (a.kind === 'code' && !(a.code?.path && Array.isArray(a.code.lines) && a.code.lines.every(l => typeof l.t === 'string'))) err(file, `결과물 ${k}: code 는 code.path 와 code.lines[].t 가 필요합니다`);
      if (a.kind === 'term' && !Array.isArray(a.term?.lines)) err(file, `결과물 ${k}: term 은 term.lines 가 필요합니다`);
      if (a.kind === 'gh' && !(a.gh?.type && a.gh.repo && a.gh.title && Array.isArray(a.gh.events) && Array.isArray(a.gh.body))) err(file, `결과물 ${k}: gh 는 type · repo · title · body · events 가 필요합니다`);
    }
    for (const it of [...(s.scene?.points ?? []), ...(s.recap ?? [])]) if (it.icon && !ICONS.has(it.icon)) err(file, `아이콘 "${it.icon}" 은 없습니다`);
    const text = JSON.stringify(s);
    for (const w of BANNED) if (text.includes(w)) err(file, `금지어 "${w}" 가 남아 있습니다`);
  }
}
if (problems) { console.error(`\n${problems}건의 문제가 있습니다.`); process.exit(1); }
console.log(`✓ 시나리오 ${ids.size}편 검사 통과`);
