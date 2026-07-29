import { notFound } from "next/navigation";

import { getPostBySlug } from "@/lib/mdx";
import { PostForm } from "@/components/admin/post-form";

export default async function EditPostPage(
  props: PageProps<"/admin/posts/[slug]/edit">,
) {
  const { slug } = await props.params;
  const post = getPostBySlug(`posts/${slug}`);
  if (!post) notFound();

  const { content, ...meta } = post;
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{meta.title} 수정</h1>
      <PostForm mode="edit" initial={{ ...meta, body: content }} />
    </div>
  );
}
