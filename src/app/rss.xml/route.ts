import { Feed } from "feed";

import { env } from "@/lib/env";
import { SITE } from "@/constants/site";
import { getAllPosts } from "@/lib/mdx";
import { absoluteUrl } from "@/lib/seo";

// RSS는 빌드타임에 확정되는 콘텐츠 → 정적 생성.
export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: SITE.title,
    description: SITE.description,
    id: env.SITE_URL,
    link: env.SITE_URL,
    language: "ko",
    copyright: `© ${new Date().getFullYear()} ${SITE.author}`,
    feedLinks: { rss: absoluteUrl("/rss.xml") },
    author: { name: SITE.author, link: env.SITE_URL },
  });

  // 최근 20개. 전문이 아니라 description만 넣는다(전문 배포는 유입에 불리).
  for (const post of getAllPosts().slice(0, 20)) {
    const link = absoluteUrl(`/blog/${post.slug}`);
    feed.addItem({
      title: post.title,
      id: link,
      link,
      description: post.description,
      date: new Date(post.date),
      category: [{ name: post.category }],
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
