import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import {
  getAllPosts,
  getAllCategories,
  getAllTags,
  getAllSeries,
} from "@/lib/mdx";
import { getAllProjects, getAllStacks } from "@/lib/projects";
import { POSTS_PER_PAGE } from "@/constants/blog";

function url(path: string): string {
  return new URL(path, env.SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const projects = getAllProjects();

  const staticRoutes = [
    "/",
    "/blog",
    "/projects",
    "/about",
    "/resume",
    "/categories",
    "/tags",
    "/uses",
    "/guestbook",
    "/contact",
  ].map((path) => ({ url: url(path), changeFrequency: "monthly" as const }));

  const postRoutes = posts.map((p) => ({
    url: url(`/blog/${p.slug}`),
    lastModified: p.date, // 글의 date를 lastModified로
    changeFrequency: "yearly" as const,
  }));

  // 블로그 페이지네이션: page 2..N (page 1은 /blog로 308 리다이렉트 → 제외).
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pageRoutes = Array.from(
    { length: Math.max(0, totalPages - 1) },
    (_, i) => ({
      url: url(`/blog/page/${i + 2}`),
      changeFrequency: "monthly" as const,
    }),
  );

  const projectRoutes = projects.map((p) => ({
    url: url(`/projects/${p.slug}`),
    changeFrequency: "yearly" as const,
  }));

  const taxonomyRoutes = [
    ...getAllCategories().map((c) =>
      url(`/categories/${encodeURIComponent(c.name)}`),
    ),
    ...getAllTags().map((t) => url(`/tags/${encodeURIComponent(t.name)}`)),
    ...getAllSeries().map((s) => url(`/series/${encodeURIComponent(s.name)}`)),
    ...getAllStacks().map((s) =>
      url(`/projects/stack/${encodeURIComponent(s.name)}`),
    ),
  ].map((u) => ({ url: u, changeFrequency: "monthly" as const }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...pageRoutes,
    ...projectRoutes,
    ...taxonomyRoutes,
  ];
}
