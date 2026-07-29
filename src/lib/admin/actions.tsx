"use server";

import type { ReactNode } from "react";
import matter from "gray-matter";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { env } from "@/lib/env";
import { frontmatterSchema, validateFrontmatter } from "@/lib/frontmatter";
import { lintMdx } from "@/lib/lint-mdx";
import { validateImages, extractImageSrcs } from "@/lib/validate-images";
import { commitPost, deletePostFile } from "@/lib/admin/github";
import { MdxRenderer } from "@/components/blog/mdx-renderer";

export interface PostFormInput {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  series?: string;
  draft: boolean;
  body: string;
}

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.login !== env.ADMIN_GITHUB_USERNAME) {
    throw new Error("인증되지 않은 요청입니다");
  }
}

// 클라이언트 폼 검증과 별개로 서버에서 재검증 — 경로 구분자·상위 디렉토리
// 이동 문자가 섞인 slug로 GitHub 커밋 경로가 벗어나는 것을 막는다.
function assertValidSlug(slug: string): void {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`올바르지 않은 slug입니다(kebab-case만 허용): ${slug}`);
  }
}

function buildFileContent(input: PostFormInput): string {
  const file = `posts/${input.slug}.mdx`;
  const frontmatterData: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    date: input.date,
    category: input.category,
    tags: input.tags,
    draft: input.draft,
  };
  if (input.thumbnail) frontmatterData.thumbnail = input.thumbnail;
  if (input.series) frontmatterData.series = input.series;

  validateFrontmatter(frontmatterSchema, file, frontmatterData);

  const raw = matter.stringify(input.body, frontmatterData);
  lintMdx([{ file, raw }]);

  const imageRefs = extractImageSrcs(input.body).map((src) => ({ file, src }));
  if (input.thumbnail) imageRefs.push({ file, src: input.thumbnail });
  validateImages(imageRefs);

  return raw;
}

export async function createPost(
  input: PostFormInput,
): Promise<{ error: string } | undefined> {
  try {
    await requireAdmin();
    assertValidSlug(input.slug);
    const raw = buildFileContent(input);
    await commitPost(input.slug, raw, `feat: ${input.title} 포스트 추가`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
  redirect("/admin/posts");
}

export async function updatePost(
  input: PostFormInput,
): Promise<{ error: string } | undefined> {
  try {
    await requireAdmin();
    assertValidSlug(input.slug);
    const raw = buildFileContent(input);
    await commitPost(input.slug, raw, `feat: ${input.title} 포스트 수정`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
  redirect("/admin/posts");
}

export async function deletePost(
  slug: string,
  title: string,
): Promise<{ error: string } | undefined> {
  try {
    await requireAdmin();
    assertValidSlug(slug);
    await deletePostFile(slug, `chore: ${title} 포스트 삭제`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
  redirect("/admin/posts");
}

export async function renderPreviewAction(body: string): Promise<ReactNode> {
  await requireAdmin();
  return <MdxRenderer source={body} />;
}
