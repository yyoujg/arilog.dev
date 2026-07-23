import type { Metadata } from "next";
import Link from "next/link";

import { getAllTags } from "@/lib/mdx";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = buildMetadata({
  title: "Tags",
  description: "태그별 글 모음.",
  path: "/tags",
});

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
      <ul className="mt-8 flex flex-wrap gap-2">
        {tags.map((t) => (
          <li key={t.name}>
            <Link
              href={`/tags/${encodeURIComponent(t.name)}`}
              className="bg-muted text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              #{t.name}
              <span className="ml-1.5 text-xs opacity-70">{t.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
