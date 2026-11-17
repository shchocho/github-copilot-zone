/**
 * 아주 작은 구문 강조기: TypeScript · JSON · Markdown 정도를 VS Code "Dark Modern" 테마 색으로 칠한다.
 * 실제 토크나이저(TextMate)가 아니라 체험용 근사치다. 색 이름은 vscode.css 의 --vsc-tk-* 와 맞춘다.
 */
import type { ReactNode } from 'react';

const CONTROL = new Set(['import', 'export', 'from', 'return', 'if', 'else', 'for', 'of', 'in', 'await', 'throw', 'try', 'catch', 'finally', 'while', 'switch', 'case', 'break', 'continue', 'default', 'as']);
const DECL = new Set(['const', 'let', 'var', 'function', 'async', 'type', 'interface', 'class', 'extends', 'implements', 'new', 'typeof', 'keyof', 'readonly', 'public', 'private', 'enum', 'void', 'true', 'false', 'null', 'undefined', 'this']);
const TYPES = new Set(['string', 'number', 'boolean', 'unknown', 'any', 'never', 'Record', 'Promise', 'Date', 'Array', 'Map', 'Set', 'Error']);

const TOKEN = /(\/\/.*$|\/\*.*?\*\/|`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|\b\d[\d_.]*\b|[A-Za-z_$][\w$]*|\s+|.)/g;

export function langOf(path: string) {
  if (/\.(ts|tsx|js|mjs|cjs)$/.test(path)) return 'ts';
  if (/\.json$/.test(path)) return 'json';
  if (/\.md$/.test(path)) return 'md';
  if (/\.ya?ml$/.test(path)) return 'yaml';
  return 'text';
}

export function Highlight({ code, lang }: { code: string; lang: string }): ReactNode {
  if (!code) return null;
  if (lang === 'md') {
    if (/^#{1,6} /.test(code)) return <span className="tk-h">{code}</span>;
    if (/^\s*[-*] /.test(code)) { const [, lead, rest] = code.match(/^(\s*[-*] )(.*)$/)!; return <><span className="tk-kw">{lead}</span>{inlineMd(rest)}</>; }
    return inlineMd(code);
  }
  if (lang === 'yaml') {
    const m = code.match(/^(\s*-?\s*)([\w.-]+)(:)(.*)$/);
    if (m) return <>{m[1]}<span className="tk-var">{m[2]}</span>{m[3]}<span className="tk-str">{m[4]}</span></>;
    return <span className="tk-str">{code}</span>;
  }
  const out: ReactNode[] = [];
  const parts = code.match(TOKEN) ?? [code];
  parts.forEach((p, i) => {
    const nextSig = parts.slice(i + 1).find(x => x.trim());
    let cls = '';
    if (p.startsWith('//') || p.startsWith('/*')) cls = 'tk-com';
    else if (/^['"`]/.test(p)) cls = lang === 'json' && nextSig === ':' ? 'tk-var' : 'tk-str';
    else if (/^\d/.test(p)) cls = 'tk-num';
    else if (/^[A-Za-z_$]/.test(p)) {
      if (lang === 'json') cls = DECL.has(p) ? 'tk-decl' : '';
      else if (CONTROL.has(p)) cls = 'tk-ctl';
      else if (DECL.has(p)) cls = 'tk-decl';
      else if (TYPES.has(p) || /^[A-Z]/.test(p)) cls = 'tk-type';
      else if (nextSig === '(') cls = 'tk-fn';
      else cls = 'tk-var';
    }
    out.push(cls ? <span key={i} className={cls}>{p}</span> : p);
  });
  return <>{out}</>;
}

function inlineMd(text: string): ReactNode {
  return text.split(/(`[^`]+`)/).map((s, i) => (s.startsWith('`') ? <span key={i} className="tk-str">{s}</span> : s));
}
