/** 화면 곳곳에서 쓰는 아이콘: 보내기 키 · 답변 아래 동작 줄 · 결과 화면의 제품 배지 */
import {
  ArrowUp20Regular, ArrowClockwise20Regular, Copy20Regular, MoreHorizontal20Regular, ThumbDislike20Regular, ThumbLike20Regular,
} from '@fluentui/react-icons';

/** 말풍선 안내의 "보내기" 키 모양 */
export const WE = {
  send: <ArrowUp20Regular fontSize={18} />,
};

/** 답변 아래 동작 아이콘 줄 */
export function AnswerActs() {
  return (
    <>
      <Copy20Regular />
      <ThumbLike20Regular />
      <ThumbDislike20Regular />
      <ArrowClockwise20Regular />
      <MoreHorizontal20Regular />
    </>
  );
}
