// GA4 이벤트 전송 얇은 래퍼. GoogleAnalytics(@next/third-parties)가 window.gtag를 심는다.
// gtag가 없으면(dev·프리뷰·미설정) 조용히 무시 → 콘솔 경고 없이 no-op.
type Gtag = (
  command: "event",
  name: string,
  params?: Record<string, unknown>,
) => void;

export function track(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, params);
}
