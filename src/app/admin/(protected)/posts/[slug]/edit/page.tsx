import { notFound } from "next/navigation";

import { getAllPostsForAdmin, getPostBySlug } from "@/lib/mdx";
import { PostForm } from "@/components/admin/post-form";

export default async function EditPostPage(
  props: PageProps<"/admin/posts/[slug]/edit">,
) {
  const { slug } = await props.params;
  const post = getPostBySlug(`posts/${slug}`);
  if (!post) notFound();

  const { content, ...meta } = post;
  const existingCategories = [
    ...new Set(getAllPostsForAdmin().map((p) => p.category)),
  ];
  return (
    <PostForm
      mode="edit"
      initial={{ ...meta, body: content }}
      existingCategories={existingCategories}
    />
  );
}
