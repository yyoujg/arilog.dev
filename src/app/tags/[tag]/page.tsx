import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllTags, getPostsByTag } from "@/lib/mdx";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.name }));
}

export async function generateMetadata(
  props: PageProps<"/tags/[tag]">,
): Promise<Metadata> {
  const { tag } = await props.params;
  const name = decodeURIComponent(tag);
  return { title: `#${name}`, description: `#${name} 태그의 글 모음.` };
}

export default async function TagPage(props: PageProps<"/tags/[tag]">) {
  const { tag } = await props.params;
  const name = decodeURIComponent(tag);
  const posts = getPostsByTag(name);
  if (!posts.length) notFound();

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">#{name}</h1>
      <p className="text-muted-foreground mt-2">{posts.length}개의 글</p>
      <div className="mt-8">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </Container>
  );
}
