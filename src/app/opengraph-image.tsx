import { SITE } from "@/constants/site";
import { OG_SIZE, OG_CONTENT_TYPE, renderOg } from "@/lib/og";

// 기본 OG (홈 및 자체 opengraph-image가 없는 모든 페이지에 상속 적용).
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = SITE.name;

export default function Image() {
  return renderOg({ eyebrow: SITE.name, title: SITE.description });
}
