/** 대화 흐름(VS Code 채팅 · GitHub Copilot 패널)에 나타나는 메시지 조각 */
import type { ReactNode } from 'react';
import type { Message } from '../types';
import { Bold, Rich } from '../engine/text';
import { AnswerActs } from './ui';

/** 대화 메시지 하나 (cue/approve/choice 는 별도 UI로 처리하므로 그리지 않음) */
export function MessageView({ m, active, ids, hold = false, toolView }: {
  m: Message; active?: boolean; ids?: string[]; hold?: boolean;
  /** 작업 단계(도구 실행 줄)를 그리는 방법 — VS Code 채팅의 VsStep */
  toolView: (text: string, active: boolean) => ReactNode;
}) {
  if (m.role === 'cue' || m.role === 'approve' || m.role === 'choice') return null;
  if (ids && m.only && !m.only.some(id => ids.includes(id))) return null;
  if (m.role === 'tool') return <>{toolView(m.tool, !!active)}</>;
  if (m.role === 'user') {
    return (
      <div className="sc-user">
        <div className="sc-user-box">
          <p><Bold text={m.text} /></p>
        </div>
      </div>
    );
  }
  return (
    <div className={`sc-answer${hold ? ' cwr-hold' : ''}`}>
      <div className="sc-answer-body">
        <Rich text={m.text} />
      </div>
      <div className="sc-answer-acts sc-zone zone-actions"><AnswerActs /></div>
    </div>
  );
}
