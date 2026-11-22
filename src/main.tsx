import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles/reference.css';
import './styles/overrides.css';
import '@vscode/codicons/dist/codicon.css';
import './styles/vscode.css';
import './styles/github.css';
import './styles/ghcp-shell.css';
import { App } from './App';
import { applyTrackColors } from './tracks';


const root = document.documentElement;
applyTrackColors();

/** 부스 화면 배율: 1371×768(가로) / 1080 폭(세로) 기준으로 확대 */
function fitZoom() {
  const portrait = window.innerHeight >= window.innerWidth;
  const z = portrait
    ? Math.min(Math.max(window.innerWidth / 1080, 1), 2.5)
    : Math.min(window.innerWidth / 1371, window.innerHeight / 768, 2.5);
  root.style.zoom = String(z);
  root.dataset.orient = portrait ? 'portrait' : 'landscape';
  root.style.setProperty('--booth-zoom', String(z));
}
fitZoom();
window.addEventListener('resize', fitZoom);

/** 키보드로 이동할 때만 포커스 테두리 표시 */
const kbd = (on: boolean) => () => root.toggleAttribute('data-kbd', on);
window.addEventListener('keydown', e => { if (e.key === 'Tab') kbd(true)(); }, true);
window.addEventListener('pointerdown', kbd(false), true);
window.addEventListener('touchstart', kbd(false), true);

const el = document.getElementById('root');
if (el) createRoot(el).render(<StrictMode><App /></StrictMode>);
