import localFont from "next/font/local";

// Pretendard Variable — 단일 woff2로 전 weight 처리.
// 파일은 src/assets/fonts/PretendardVariable.woff2 에 위치.
// fallback size-adjust로 CLS 방지 (Pretendard 미로드 시에도 폭 유사).
export const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "sans-serif",
  ],
  adjustFontFallback: false,
});
