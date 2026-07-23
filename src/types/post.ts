export interface Frontmatter {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: string;
  tags: string[];
  thumbnail?: string;
  series?: string;
  draft: boolean;
}

export interface Post extends Frontmatter {
  slug: string; // 경로 기반. content/react/use-memo.mdx -> "react/use-memo"
  content: string; // gray-matter로 분리한 원본 MDX 본문
  readingTime: number; // 분
}

export type PostMeta = Omit<Post, "content">;

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface SeriesInfo {
  name: string;
  posts: PostMeta[];
}

export interface CountItem {
  name: string;
  count: number;
}
