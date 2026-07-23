import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllPosts, getPostBySlug, getAdjacentPosts } from "@/lib/mdx";
import { extractToc } from "@/lib/toc";
import { buildMetadata, blogPostingLd } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { PostMeta } from "@/components/blog/post-meta";
import { PostNav } from "@/components/blog/post-nav";
import { Toc } from "@/components/blog/toc";
import { MdxRenderer } from "@/components/blog/mdx-renderer";
import { JsonLd } from "@/components/seo/json-ld";

// 글은 정확히 <카테고리>/<파일> 2단계(loadPosts에서 검증). slug는 "cat/file".
export function generateStaticParams() {
  return getAllPosts().map((post) => {
    const [category, slug] = post.slug.split("/");
    return { category, slug };
  });
}

export async function generateMetadata(
  props: PageProps<"/blog/[category]/[slug]">,
): Promise<Metadata> {
  const { category, slug } = await props.params;
  const post = getPostBySlug(`${category}/${slug}`);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    ogType: "article",
  });
}

export default async function PostPage(
  props: PageProps<"/blog/[category]/[slug]">,
) {
  const { category, slug } = await props.params;
  const post = getPostBySlug(`${category}/${slug}`);
  if (!post) notFound();

  const toc = extractToc(post.content);
  const { prev, next } = getAdjacentPosts(post.slug);

  return (
    <Container className="py-12">
      <JsonLd data={blogPostingLd(post)} />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10">
        <aside className="lg:order-2">
          <Toc toc={toc} />
        </aside>

        <article className="lg:order-1">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              {post.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <PostMeta
                date={post.date}
                readingTime={post.readingTime}
                category={post.category}
              />
              {post.series && (
                <Link
                  href={`/series/${encodeURIComponent(post.series)}`}
                  className="bg-accent text-accent-foreground rounded-md px-2 py-0.5 text-sm"
                >
                  시리즈: {post.series}
                </Link>
              )}
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="bg-muted text-muted-foreground hover:text-foreground rounded-md px-2 py-0.5 text-xs transition-colors"
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          </header>

          <div className="prose">
            <MdxRenderer source={post.content} />
          </div>

          <PostNav prev={prev} next={next} />
        </article>
      </div>
    </Container>
  );
}
