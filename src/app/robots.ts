import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // 색인 불가 환경(프리뷰/로컬): 전체 차단 + sitemap 미노출.
  if (!env.IS_INDEXABLE) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", env.SITE_URL).toString(),
    host: env.SITE_URL,
  };
}
