import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";
import subsetFont from "subset-font";

import { SITE } from "@/constants/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

// 폰트는 import가 아니라 fs로 읽는다. process.cwd()는 빌드/런타임 모두 프로젝트
// 루트를 가리키고, src/assets는 traceIncludes 대상이라 Vercel 번들에도 포함된다.
// 모듈 스코프에서 1회만 읽어 캐시한다.
function readFontFile(name: string): Buffer | null {
  const p = path.join(FONT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}
// satori는 woff2 미지원 → OTF 사용(전체 글리프, TTF보다 작음). subset-font가
// 빌드타임에 제목별로 서브셋하므로 각 OG에는 쓰인 글자만 들어간다.
const REGULAR = readFontFile("Pretendard-Regular.otf");
const BOLD = readFontFile("Pretendard-Bold.otf");

export const OG_FONTS_AVAILABLE = REGULAR !== null || BOLD !== null;

interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}

// 각 이미지에 실제로 쓰인 글자만 서브셋해 Satori에 넘긴다(고정 2350자 방식은
// 희귀 음절에서 두부가 나므로 쓰지 않는다). 굵기별로 실제 텍스트만 로드.
async function ogFonts(
  regularText: string,
  boldText: string,
): Promise<OgFont[]> {
  const fonts: OgFont[] = [];
  if (REGULAR) {
    fonts.push({
      name: "Pretendard",
      data: await subsetFont(REGULAR, regularText || " "),
      weight: 400,
      style: "normal",
    });
  }
  if (BOLD) {
    fonts.push({
      name: "Pretendard",
      data: await subsetFont(BOLD, boldText || " "),
      weight: 700,
      style: "normal",
    });
  }
  return fonts;
}

export async function renderOg({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}): Promise<ImageResponse> {
  const regularText = `${eyebrow ?? ""} ${SITE.name} ${SITE.url}`;
  const fonts = await ogFonts(regularText, title);
  const fontFamily = fonts.length ? "Pretendard" : "sans-serif";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a0a0a",
        color: "#fafafa",
        padding: "80px",
        fontFamily,
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#a1a1aa" }}>
        {eyebrow ?? SITE.title}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          color: "#a1a1aa",
        }}
      >
        <span>{SITE.name}</span>
        <span>{SITE.url.replace(/^https?:\/\//, "")}</span>
      </div>
    </div>,
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
