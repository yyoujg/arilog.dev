import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllCategories, getPostsByCategory } from "@/lib/mdx";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { CategoryFilter } from "@/components/blog/category-filter";

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ category: c.name }));
}

export async function generateMetadata(
  props: PageProps<"/categories/[category]">,
): Promise<Metadata> {
  const { category } = await props.params;
  const name = decodeURIComponent(category);
  return {
    title: `${name} 카테고리`,
    description: `${name} 카테고리의 글 모음.`,
  };
}

export default async function CategoryPage(
  props: PageProps<"/categories/[category]">,
) {
  const { category } = await props.params;
  const name = decodeURIComponent(category);
  const posts = getPostsByCategory(name);
  if (!posts.length) notFound();

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
      <p className="text-muted-foreground mt-2">{posts.length}개의 글</p>
      <div className="mt-6">
        <CategoryFilter categories={getAllCategories()} active={name} />
      </div>
      <div className="mt-8">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </Container>
  );
}
