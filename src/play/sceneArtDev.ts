/*
 * GitHub Copilot 체험 존의 상황 그림. 모두 같은 틀: 왼쪽 = 어두운 편집기 창(파일 이름 · 코드 줄 · 문제 줄 · 메모),
 * 오른쪽 = 카드 하나(제목 · 목록 세 줄 · 그림). 오른쪽 그림만 종류마다 다르다.
 * 슬롯: 파일 · 강조 · 메모 · 그림제목 · 항목1~3 · 배지   (글자는 한 줄에 16자 안팎)
 * 강조색은 영역 색(--track)을 따른다.
 */
const ACC = 'var(--track,#0969da)';
const INK = '#1f2328', SUB = '#59636e', LINE = '#d1d9e0';

const code = (y: number, parts: [number, number, string][]) =>
  parts.map(([x, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3.5" fill="${c}"/>`).join('');

function dev(id: string, picto: string): string {
  return `<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet">
<defs><filter id="${id}S" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#0d1117" flood-opacity=".18"/></filter></defs>
<rect x="0" y="0" width="800" height="450" fill="#f6f8fa"/>
<path d="M0 392h800v58H0z" fill="#eaeef2"/>
<g class="il-fade il-d1">
<rect x="40" y="58" width="420" height="296" rx="12" fill="#1f1f1f" filter="url(#${id}S)"/>
<path d="M40 70a12 12 0 0 1 12-12h396a12 12 0 0 1 12 12v18H40z" fill="#181818"/>
<circle cx="60" cy="74" r="4.5" fill="#ff5f57"/><circle cx="76" cy="74" r="4.5" fill="#febc2e"/><circle cx="92" cy="74" r="4.5" fill="#28c840"/>
<rect x="114" y="66" width="150" height="16" rx="3" fill="#1f1f1f"/>
<text x="124" y="78" font-size="10.5" fill="#cccccc" font-family="Consolas, monospace">{{파일}}</text>
<g transform="translate(0 0)">
<text x="56" y="116" font-size="10" fill="#6e7681" font-family="Consolas, monospace">12</text>${code(109, [[86, 46, '#c586c0'], [138, 70, '#9cdcfe'], [214, 60, '#dcdcaa']])}
<text x="56" y="138" font-size="10" fill="#6e7681" font-family="Consolas, monospace">13</text>${code(131, [[100, 38, '#569cd6'], [144, 92, '#9cdcfe'], [242, 40, '#ce9178']])}
<text x="56" y="160" font-size="10" fill="#6e7681" font-family="Consolas, monospace">14</text>${code(153, [[100, 120, '#9cdcfe'], [226, 50, '#dcdcaa']])}
</g>
</g>
<g class="il-fade il-d2">
<rect x="78" y="174" width="366" height="26" rx="4" style="fill:${ACC}" opacity=".22"/>
<rect x="78" y="174" width="3" height="26" style="fill:${ACC}"/>
<text x="92" y="191" font-size="11.5" fill="#e7e7e7" font-family="Consolas, monospace">{{강조}}</text>
<text x="56" y="214" font-size="10" fill="#6e7681" font-family="Consolas, monospace">16</text>${code(207, [[100, 64, '#569cd6'], [170, 110, '#9cdcfe']])}
<text x="56" y="236" font-size="10" fill="#6e7681" font-family="Consolas, monospace">17</text>${code(229, [[114, 150, '#ffffff40'], [270, 60, '#ffffff40']])}
<text x="56" y="258" font-size="10" fill="#6e7681" font-family="Consolas, monospace">18</text>${code(251, [[114, 96, '#ffffff40']])}
</g>
<g class="il-fade il-d3">
<rect x="210" y="282" width="232" height="54" rx="8" fill="#fff8c5" stroke="#d4a72c" stroke-width="1.2"/>
<text x="224" y="314" font-size="12" fill="#633c01">{{메모}}</text>
</g>
<g class="il-fade il-d4">
<rect x="500" y="58" width="260" height="296" rx="14" fill="#fff" stroke="${LINE}" filter="url(#${id}S)"/>
<text x="522" y="90" font-size="13" font-weight="700" fill="${INK}">{{그림제목}}</text>
<path d="M500 104h260" stroke="${LINE}"/>
${picto}
</g>
<g class="il-fade il-d5">
<rect x="500" y="368" width="190" height="30" rx="15" style="fill:${ACC}"/>
<text x="595" y="388" font-size="12" font-weight="600" fill="#fff" text-anchor="middle">{{배지}}</text>
</g>
</svg>`;
}

const items = (mark: (y: number) => string) => [0, 1, 2].map(i => {
  const y = 136 + i * 40;
  return `${mark(y)}<text x="550" y="${y + 4}" font-size="12" fill="${SUB}">{{항목${i + 1}}}</text><path d="M522 ${y + 20}h216" stroke="#eef1f4"/>`;
}).join('\n');

/* 오른쪽 카드 아래쪽 그림 (가로 520~740, 세로 250~340) */
const PICTO: Record<string, string> = {
  // 실패한 테스트 목록
  tests: `${items(y => `<circle cx="532" cy="${y}" r="8" fill="#ffebe9"/><path d="m528 ${y - 4} 8 8m0-8-8 8" stroke="#cf222e" stroke-width="2"/>`)}
<rect x="522" y="262" width="216" height="72" rx="8" fill="#0d1117"/><text x="534" y="286" font-size="11" fill="#ff7b72" font-family="Consolas, monospace">FAIL  2 failed</text><text x="534" y="306" font-size="11" fill="#7ee787" font-family="Consolas, monospace">PASS  14 passed</text><text x="534" y="324" font-size="11" fill="#8b949e" font-family="Consolas, monospace">Tests: 16 total</text>`,
  // 할 일 · 이슈 목록
  issue: `${items(y => `<circle cx="532" cy="${y}" r="7.5" fill="none" stroke="#1a7f37" stroke-width="2"/><circle cx="532" cy="${y}" r="2" fill="#1a7f37"/>`)}
<rect x="522" y="262" width="216" height="72" rx="8" fill="#f6f8fa" stroke="${LINE}"/><circle cx="546" cy="298" r="12" style="fill:${ACC}" opacity=".2"/><path d="M540 298h12M546 292v12" style="stroke:${ACC}" stroke-width="2.4" stroke-linecap="round"/><path d="M568 290h140M568 306h100" stroke="#d1d9e0" stroke-width="6" stroke-linecap="round"/>`,
  // 리뷰 코멘트
  review: `${items(y => `<rect x="524" y="${y - 8}" width="16" height="16" rx="4" fill="#ddf4ff"/><path d="M528 ${y - 1}h8M528 ${y + 3}h5" stroke="#0969da" stroke-width="1.6"/>`)}
<rect x="522" y="262" width="216" height="72" rx="8" fill="#fff" stroke="${LINE}"/><rect x="522" y="262" width="216" height="22" rx="8" fill="#f6f8fa"/><path d="M534 300h120" stroke="#cf222e" stroke-width="6" stroke-linecap="round" opacity=".35"/><path d="M534 318h150" stroke="#1a7f37" stroke-width="6" stroke-linecap="round" opacity=".45"/>`,
  // 문서 · 설명
  docs: `${items(y => `<path d="M526 ${y - 8}h10l5 5v11h-15z" fill="#eaeef2" stroke="#8c959f" stroke-width="1.2"/>`)}
<rect x="522" y="262" width="216" height="72" rx="8" fill="#f6f8fa" stroke="${LINE}"/><path d="M538 284h120M538 300h170M538 316h140" stroke="#d1d9e0" stroke-width="6" stroke-linecap="round"/><circle cx="716" cy="284" r="9" style="fill:${ACC}" opacity=".25"/>`,
  // 커밋 · 브랜치
  commit: `${items(y => `<circle cx="532" cy="${y}" r="6" fill="#fff" stroke="#8250df" stroke-width="2.4"/>`)}
<rect x="522" y="262" width="216" height="72" rx="8" fill="#f6f8fa" stroke="${LINE}"/><path d="M546 278v40M546 298c0-14 26-14 26-28" stroke="#8250df" stroke-width="2.4" fill="none"/><circle cx="546" cy="318" r="5" fill="#8250df"/><circle cx="572" cy="270" r="5" fill="#8250df"/><path d="M590 292h120M590 310h90" stroke="#d1d9e0" stroke-width="6" stroke-linecap="round"/>`,
};

export const SCENE_ART_DEV: Record<string, string> = Object.fromEntries(
  Object.entries(PICTO).map(([k, p]) => [`dev-${k}`, dev(`dev${k}`, p)]),
);
