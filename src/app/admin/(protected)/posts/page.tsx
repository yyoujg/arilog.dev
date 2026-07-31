import Link from "next/link";
import { Pencil } from "lucide-react";

import { getAllPostsForAdmin } from "@/lib/mdx";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { DeletePostDialog } from "@/components/admin/delete-post-dialog";

// 공개/비공개 상태를 같은 outline 뱃지 셸 + 점 색상만 다르게 표시한다.
// 카테고리별 색분기(과거 해시 배정)도 이 파일에서 한 뱃지 스타일로 통일 —
// 한 행에 형광 fill이 여러 개 섞이는 걸 막기 위함(뱃지가 튀는 요소는
// hover 등 최소한으로 제한).
function StatusBadge({ published }: { published: boolean }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={`size-1.5 rounded-full ${published ? "bg-success" : "bg-muted-foreground"}`}
      />
      {published ? "공개" : "비공개"}
    </Badge>
  );
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
                  <th className="w-full py-3 pr-4 font-semibold">제목</th>
                  <th className="py-3 pr-4 text-right font-semibold whitespace-nowrap">
                    날짜
                  </th>
                  <th className="py-3 pr-4 font-semibold whitespace-nowrap">
                    카테고리
                  </th>
                  <th className="py-3 pr-4 font-semibold whitespace-nowrap">
                    상태
                  </th>
                  <th className="py-3 pr-4 font-semibold whitespace-nowrap">
                    관리
                  </th>
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
                      <td className="py-3 pr-4 text-right whitespace-nowrap tabular-nums">
                        {post.date}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <Badge variant="outline">{post.category}</Badge>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <StatusBadge published={!post.hidden} />
                          {post.hidden && post.hiddenReason && (
                            <span className="text-muted-foreground text-xs whitespace-normal">
                              {post.hiddenReason}
                            </span>
                          )}
                          {post.missingFields.length > 0 && (
                            <span className="text-muted-foreground text-xs whitespace-normal">
                              누락 필드 기본값 처리:{" "}
                              {post.missingFields.join(", ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {managed ? (
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/posts/${filename}/edit`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                              })}
                            >
                              <Pencil />
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
                    <span className="min-w-0 flex-1 font-semibold">
                      {post.title}
                    </span>
                    <StatusBadge published={!post.hidden} />
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs tabular-nums">
                    <span className="whitespace-nowrap">{post.date}</span>
                    <Badge variant="outline">{post.category}</Badge>
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
                          <Pencil />
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
