import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { Post, PostMeta, CountItem, SeriesInfo } from "@/types/post";
import { parseFrontmatter } from "@/lib/frontmatter";
import { readingTime } from "@/lib/reading-time";
import { validateImages, extractImageSrcs } from "@/lib/validate-images";
import { lintMdx } from "@/lib/lint-mdx";

const CONTENT_DIR = path.join(process.cwd(), "content");
const isProd = process.env.NODE_ENV === "production";

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".mdx") ? [full] : [];
  });
}

function loadPosts(): Post[] {
  const entries = walk(CONTENT_DIR).map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const relative = path.relative(CONTENT_DIR, file);
    const fm = parseFrontmatter(relative, data);
    const post = {
      ...fm,
      slug: relative
        .replace(/\.mdx$/, "")
        .split(path.sep)
        .join("/"),
      content,
      readingTime: readingTime(content),
    } satisfies Post;
    return { post, file: relative, raw };
  });

  const published = entries
    .filter((e) => !(isProd && e.post.draft))
    .sort((a, b) =>
      a.post.date < b.post.date ? 1 : a.post.date > b.post.date ? -1 : 0,
    );

  // MDX 린트: blockJS로 삭제되는 표현식/import/export 사전 차단.
  lintMdx(published.map((e) => ({ file: e.file, raw: e.raw })));

  // 본문·thumbnail 이미지 검증 (dev warn / prod 누락 집계 후 실패).
  validateImages(
    published.flatMap((e) => {
      const srcs = extractImageSrcs(e.post.content);
      if (e.post.thumbnail) srcs.push(e.post.thumbnail);
      return srcs.map((src) => ({ file: e.file, src }));
    }),
  );

  return published.map((e) => e.post);
}

// 모듈 레벨 캐시 — 빌드 중 중복 파싱 방지.
let cache: Post[] | null = null;
function allPosts(): Post[] {
  if (!cache) cache = loadPosts();
  return cache;
}

function toMeta({ content: _content, ...meta }: Post): PostMeta {
  return meta;
}

export function getAllPosts(): PostMeta[] {
  return allPosts().map(toMeta);
}

export function getPostBySlug(slug: string): Post | undefined {
  return allPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function getAllCategories(): CountItem[] {
  return countBy(getAllPosts().map((p) => p.category));
}

export function getAllTags(): CountItem[] {
  return countBy(getAllPosts().flatMap((p) => p.tags));
}

export function getSeries(name: string): SeriesInfo | undefined {
  const posts = getAllPosts()
    .filter((p) => p.series === name)
    // 시리즈 내부는 오래된 순(연재 순서)으로 뒤집는다.
    .reverse();
  return posts.length ? { name, posts } : undefined;
}

export function getAllSeries(): SeriesInfo[] {
  const names = [
    ...new Set(
      getAllPosts()
        .map((p) => p.series)
        .filter(Boolean),
    ),
  ];
  return names.map((name) => getSeries(name as string)!);
}

export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const posts = getAllPosts(); // date 내림차순
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  // prev = 더 이전 글(뒤), next = 더 최신 글(앞)
  return {
    prev: posts[i + 1] ?? null,
    next: posts[i - 1] ?? null,
  };
}

function countBy(items: string[]): CountItem[] {
  const map = new Map<string, number>();
  for (const item of items) map.set(item, (map.get(item) ?? 0) + 1);
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
