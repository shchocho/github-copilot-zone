/** 대화 흐름(채팅 · 세션 로그) 스크롤 도우미와 화면 영역 표시 */

/** 화면 영역(zone) 이름 → class. 말풍선이 붙을 자리(.zone-composer 등)를 찾는 데 쓴다 */
export type Mark = (zone: string) => string;

export const scrollToBottom = (el?: HTMLElement | null) => el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });

/** 멈춰 둔 답변(.cwr-hold)의 머리가 보이게 스크롤 */
export function scrollToHold(el?: HTMLElement | null) {
  const hold = el?.querySelector('.cwr-hold');
  if (!el || !hold) return;
  const go = () => {
    const r = hold.getBoundingClientRect();
    if (r.height <= el.clientHeight) return;
    el.scrollTo({ top: Math.max(0, el.scrollTop + (r.top - el.getBoundingClientRect().top) - 12), behavior: 'smooth' });
  };
  go();
  const ro = new ResizeObserver(go);
  ro.observe(hold);
  return () => ro.disconnect();
}
