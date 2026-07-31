import { getAllPostsForAdmin } from "@/lib/mdx";
import { PostForm } from "@/components/admin/post-form";

export default function NewPostPage() {
  const existingCategories = [
    ...new Set(getAllPostsForAdmin().map((p) => p.category)),
  ];
  return <PostForm mode="create" existingCategories={existingCategories} />;
}
