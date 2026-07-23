import type { Metadata } from "next";
import Link from "next/link";

import { getAllCategories } from "@/lib/mdx";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "카테고리별 글 모음.",
  path: "/categories",
});

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      <ul className="mt-8 flex flex-wrap gap-3">
        {categories.map((c) => (
          <li key={c.name}>
            <Link
              href={`/categories/${encodeURIComponent(c.name)}`}
              className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2"
            >
              <span className="font-semibold">{c.name}</span>
              <span className="text-muted-foreground text-sm">{c.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
