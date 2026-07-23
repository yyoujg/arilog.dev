import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllSeries, getSeries } from "@/lib/mdx";
import { Container } from "@/components/layout/container";
import { PostMeta } from "@/components/blog/post-meta";

export function generateStaticParams() {
  return getAllSeries().map((s) => ({ series: s.name }));
}

export async function generateMetadata(
  props: PageProps<"/series/[series]">,
): Promise<Metadata> {
  const { series } = await props.params;
  const name = decodeURIComponent(series);
  return { title: `시리즈: ${name}`, description: `${name} 시리즈 글 모음.` };
}

export default async function SeriesPage(props: PageProps<"/series/[series]">) {
  const { series } = await props.params;
  const name = decodeURIComponent(series);
  const info = getSeries(name);
  if (!info) notFound();

  return (
    <Container className="py-12">
      <p className="text-muted-foreground text-sm">시리즈</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{name}</h1>
      <p className="text-muted-foreground mt-2">{info.posts.length}개의 글</p>
      <ol className="mt-8 space-y-4">
        {info.posts.map((post, i) => (
          <li key={post.slug} className="flex gap-4">
            <span className="text-muted-foreground pt-0.5 font-mono text-sm">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-primary font-semibold"
              >
                {post.title}
              </Link>
              <PostMeta
                date={post.date}
                readingTime={post.readingTime}
                className="mt-1"
              />
            </div>
          </li>
        ))}
      </ol>
    </Container>
  );
}
