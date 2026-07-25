import localFont from "next/font/local";

// Pretendard 서브셋 3웨이트(400/600/700). 프로젝트는 이 세 웨이트만 쓴다.
// (500/medium 미지원 — 한글에서 500/600 육안 구분이 거의 안 되고 261K를 더 씀.)
// adjustFontFallback: "Arial" → Next가 실제 폰트 metric을 읽어 size-adjust/
// ascent/descent-override를 계산한 fallback face를 생성한다(추측 없이 CLS 방지).
export const pretendard = localFont({
  src: [
    {
      path: "../assets/fonts/Pretendard-Regular.subset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Pretendard-SemiBold.subset.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/Pretendard-Bold.subset.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: [
    "system-ui",
    "-apple-system",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "sans-serif",
  ],
});
