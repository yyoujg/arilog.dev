import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { getAllPostsForAdmin } from "@/lib/mdx";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { DeletePostDialog } from "@/components/admin/delete-post-dialog";

// 카테고리는 자유 문자열이라 고정 색 매핑이 없다. 임의 색을 새로 만드는 대신
// 기존 배지 톤(4종)을 이름 해시로 순환 배정 — 항상 텍스트 라벨과 함께 표시되므로
// 색만으로 카테고리를 구분하지 않는다(접근성 원칙 유지).
const CATEGORY_VARIANTS: NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>[] = ["default", "secondary", "muted", "outline"];

function categoryVariant(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0;
  }
  return CATEGORY_VARIANTS[Math.abs(hash) % CATEGORY_VARIANTS.length];
}

export default function AdminPostsPage() {
  const posts = getAllPostsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Posts</h1>
        <Link href="/admin/posts/new" className={buttonVariants()}>
          새 글 작성
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-md border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">
            아직 작성된 글이 없습니다.
          </p>
          <Link href="/admin/posts/new" className={buttonVariants()}>
            첫 글 작성하기
          </Link>
        </div>
      ) : (
        <>
          {/* md 이상: 표 */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="py-3 pr-4 font-semibold">제목</th>
                  <th className="py-3 pr-4 font-semibold">날짜</th>
                  <th className="py-3 pr-4 font-semibold">카테고리</th>
                  <th className="py-3 pr-4 font-semibold">상태</th>
                  <th className="py-3 pr-4 font-semibold">관리</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const managed = post.slug.startsWith("posts/");
                  const filename = post.slug.replace(/^posts\//, "");
                  return (
                    <tr
                      key={post.slug}
                      className="border-border hover:bg-accent/50 border-b transition-colors"
                    >
                      <td className="py-3 pr-4">{post.title}</td>
                      <td className="py-3 pr-4 tabular-nums">{post.date}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={categoryVariant(post.category)}>
                          {post.category}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          {post.hidden ? (
                            <Badge variant="muted">
                              비공개
                              {post.hiddenReason && ` (${post.hiddenReason})`}
                            </Badge>
                          ) : (
                            <Badge variant="success">공개</Badge>
                          )}
                          {post.missingFields.length > 0 && (
                            <span className="text-muted-foreground text-xs">
                              누락 필드 기본값 처리:{" "}
                              {post.missingFields.join(", ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
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
                            <DeletePostDialog
                              slug={filename}
                              title={post.title}
                            />
                          </div>
                        ) : (
                          <Badge variant="outline">읽기 전용</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* md 미만: 카드 */}
          <div className="flex flex-col gap-3 md:hidden">
            {posts.map((post) => {
              const managed = post.slug.startsWith("posts/");
              const filename = post.slug.replace(/^posts\//, "");
              return (
                <div
                  key={post.slug}
                  className="border-border flex flex-col gap-2 rounded-md border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{post.title}</span>
                    {post.hidden ? (
                      <Badge variant="muted">비공개</Badge>
                    ) : (
                      <Badge variant="success">공개</Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs tabular-nums">
                    <span>{post.date}</span>
                    <Badge variant={categoryVariant(post.category)}>
                      {post.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {managed ? (
                      <>
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
                      </>
                    ) : (
                      <Badge variant="outline">읽기 전용</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
