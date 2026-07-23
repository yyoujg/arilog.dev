import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllPosts, getAllCategories } from "@/lib/mdx";
import { POSTS_PER_PAGE } from "@/constants/blog";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { CategoryFilter } from "@/components/blog/category-filter";
import { Pagination } from "@/components/blog/pagination";

function totalPages(): number {
  return Math.ceil(getAllPosts().length / POSTS_PER_PAGE);
}

// 2페이지부터만 정적 생성. 1페이지는 /blog로 리다이렉트.
export function generateStaticParams() {
  const total = totalPages();
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata(
  props: PageProps<"/blog/page/[page]">,
): Promise<Metadata> {
  const { page } = await props.params;
  return buildMetadata({
    title: `Blog (${page}페이지)`,
    description: "프론트엔드 기술 블로그 글 목록.",
    path: `/blog/page/${page}`,
  });
}

export default async function BlogPagedPage(
  props: PageProps<"/blog/page/[page]">,
) {
  const { page } = await props.params;
  const pageNum = Number(page);

  // page 1은 next.config redirects()에서 308로 /blog로 넘긴다.
  if (!Number.isInteger(pageNum) || pageNum < 2) notFound();

  const posts = getAllPosts();
  const total = totalPages();
  if (pageNum > total) notFound();

  const categories = getAllCategories();
  const start = (pageNum - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <div className="mt-6">
        <CategoryFilter categories={categories} />
      </div>
      <div className="mt-8">
        {pagePosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination currentPage={pageNum} totalPages={total} />
    </Container>
  );
}
