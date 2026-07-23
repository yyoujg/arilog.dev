import Link from "next/link";

import type { PostMeta as PostMetaType } from "@/types/post";
import { PostMeta } from "@/components/blog/post-meta";

export function PostCard({ post }: { post: PostMetaType }) {
  return (
    <article className="border-border group border-b py-6 first:pt-0">
      <Link href={`/blog/${post.slug}`} className="block">
        <h2 className="group-hover:text-primary text-xl font-semibold tracking-tight transition-colors">
          {post.title}
        </h2>
        <p className="text-muted-foreground mt-2 line-clamp-2">
          {post.description}
        </p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <PostMeta
          date={post.date}
          readingTime={post.readingTime}
          category={post.category}
        />
        <ul className="flex flex-wrap gap-1.5">
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
      </div>
    </article>
  );
}
