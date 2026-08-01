import type { Metadata } from "next";

import { getAllPosts, getAllCategories } from "@/lib/mdx";
import { POSTS_PER_PAGE } from "@/constants/blog";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { CategoryFilter } from "@/components/blog/category-filter";
import { Pagination } from "@/components/blog/pagination";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "예약·결제·디자인 시스템·RSC를 다루며 만난 버그와, 도구를 의심해 근본 원인을 검증한 기록.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pagePosts = posts.slice(0, POSTS_PER_PAGE);

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
      <Pagination currentPage={1} totalPages={totalPages} />
    </Container>
  );
}
