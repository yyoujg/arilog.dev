import type { Metadata } from "next";

import { env } from "@/lib/env";
import { SITE } from "@/constants/site";
import type { PostMeta } from "@/types/post";
import type { ProjectMeta } from "@/types/project";

export const PERSON_ID = `${env.SITE_URL}/#person`;

export function absoluteUrl(path: string): string {
  return new URL(path, env.SITE_URL).toString();
}

// 페이지별 metadata. canonical/OG url은 항상 절대 URL.
// robots(index 여부)는 루트 layout에서 전역 처리하므로 여기선 다루지 않는다.
// og:image는 파일 기반 opengraph-image.tsx 규약이 자동 주입한다.
// og:image / twitter:image는 opengraph-image.tsx 파일 규약이 자동 주입하므로
// 여기서 수동으로 넣지 않는다(중복 방지). 가장 가까운 opengraph-image가 상속된다.
export function buildMetadata({
  title,
  description,
  path,
  ogType = "website",
}: {
  title?: string;
  description?: string;
  path: string;
  ogType?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      url,
      title,
      description,
      siteName: SITE.name,
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function personLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.author,
    url: env.SITE_URL,
    sameAs: [SITE.github, SITE.linkedin],
  };
}

export function blogPostingLd(post: PostMeta): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    keywords: post.tags.join(", "),
    author: { "@id": PERSON_ID },
    url: absoluteUrl(`/blog/${post.slug}`),
  };
}

// 프로젝트 상세는 "소프트웨어 자체"가 아니라 그 소프트웨어에 대한 케이스 스터디
// 글이므로 TechArticle. (SoftwareApplication은 rich result에 rating/offers를
// 요구하는데 실측 평점이 없어 부적합.) 소프트웨어는 about으로 참조한다.
export function techArticleLd(project: ProjectMeta): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.summary,
    author: { "@id": PERSON_ID },
    url: absoluteUrl(`/projects/${project.slug}`),
    // datePublished/dateModified 없음: frontmatter에 발행일이 없고 화면에도 없음.
    // image 없음: 썸네일이 placeholder라 실제 스크린샷일 때만 추가.
    // TODO: 실제 스크린샷 배치 후 image 추가
  };

  if (project.github || project.demo) {
    const about: Record<string, unknown> = {
      "@type": "SoftwareSourceCode",
      name: project.title,
      programmingLanguage: project.stack,
    };
    if (project.github) about.codeRepository = project.github;
    if (project.demo) about.url = project.demo;
    ld.about = about;
  }

  return ld;
}
