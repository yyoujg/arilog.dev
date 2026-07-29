import Link from "next/link";

import { getAllPosts } from "@/lib/mdx";
import { buttonVariants } from "@/components/ui/button-variants";
import { DeletePostDialog } from "@/components/admin/delete-post-dialog";

export default function AdminPostsPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Posts</h1>
        <Link href="/admin/posts/new" className={buttonVariants()}>
          새 글 작성
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-border border-b text-left">
              <th className="py-2 pr-4">title</th>
              <th className="py-2 pr-4">date</th>
              <th className="py-2 pr-4">category</th>
              <th className="py-2 pr-4">draft</th>
              <th className="py-2 pr-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const managed = post.slug.startsWith("posts/");
              const filename = post.slug.replace(/^posts\//, "");
              return (
                <tr key={post.slug} className="border-border border-b">
                  <td className="py-2 pr-4">{post.title}</td>
                  <td className="py-2 pr-4">{post.date}</td>
                  <td className="py-2 pr-4">{post.category}</td>
                  <td className="py-2 pr-4">{post.draft ? "Y" : ""}</td>
                  <td className="py-2 pr-4">
                    {managed ? (
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/posts/${filename}/edit`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          수정
                        </Link>
                        <DeletePostDialog slug={filename} title={post.title} />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        읽기 전용(레거시 폴더)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
