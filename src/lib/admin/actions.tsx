"use server";

import type { ReactNode } from "react";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { env } from "@/lib/env";
import { frontmatterSchema, validateFrontmatter } from "@/lib/frontmatter";
import { projectSchema } from "@/lib/project-frontmatter";
import { RESERVED_SLUGS } from "@/lib/projects";
import { lintMdx } from "@/lib/lint-mdx";
import { validateImages, extractImageSrcs } from "@/lib/validate-images";
import {
  commitContentFile,
  deleteContentFile,
  contentFileExists,
  commitImage,
} from "@/lib/admin/github";
import { MdxRenderer } from "@/components/blog/mdx-renderer";

// MIME으로 실제 저장 확장자를 정한다(파일명 위장 방지). 원본 파일명 확장자도
// 화이트리스트로 별도 검증해 MIME 스푸핑에 대한 이중 방어를 둔다.
const IMAGE_MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_KINDS = new Set(["posts", "projects"]);

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

export interface ProjectFormInput {
  slug: string;
  title: string;
  summary: string;
  period: string;
  role: string;
  stack: string[];
  github?: string;
  demo?: string;
  thumbnail: string;
  featured: boolean;
  draft: boolean;
  order: number;
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
  if (!/^[a-z0-9\-]+$/.test(slug)) {
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

function buildProjectFileContent(input: ProjectFormInput): string {
  const file = `projects/${input.slug}.mdx`;
  const frontmatterData: Record<string, unknown> = {
    title: input.title,
    summary: input.summary,
    period: input.period,
    role: input.role,
    stack: input.stack,
    thumbnail: input.thumbnail,
    featured: input.featured,
    draft: input.draft,
    order: input.order,
  };
  if (input.github) frontmatterData.github = input.github;
  if (input.demo) frontmatterData.demo = input.demo;

  validateFrontmatter(projectSchema, file, frontmatterData);

  const raw = matter.stringify(input.body, frontmatterData);
  lintMdx([{ file, raw }]);

  const imageRefs = extractImageSrcs(input.body).map((src) => ({ file, src }));
  imageRefs.push({ file, src: input.thumbnail });
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
    await commitContentFile(
      `content/posts/${input.slug}.mdx`,
      raw,
      `feat: ${input.title} 포스트 추가`,
    );
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
    await commitContentFile(
      `content/posts/${input.slug}.mdx`,
      raw,
      `feat: ${input.title} 포스트 수정`,
    );
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
    await deleteContentFile(
      `content/posts/${slug}.mdx`,
      `chore: ${title} 포스트 삭제`,
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
  redirect("/admin/posts");
}

export async function createProject(
  input: ProjectFormInput,
): Promise<{ error: string } | undefined> {
  try {
    await requireAdmin();
    assertValidSlug(input.slug);
    if (RESERVED_SLUGS.has(input.slug)) {
      throw new Error(`예약된 slug입니다(다른 라우트와 충돌): ${input.slug}`);
    }
    const path = `content/projects/${input.slug}.mdx`;
    if (await contentFileExists(path)) {
      throw new Error(`이미 존재하는 slug입니다: ${input.slug}`);
    }
    const raw = buildProjectFileContent(input);
    await commitContentFile(path, raw, `feat: ${input.title} 프로젝트 추가`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
  redirect("/admin/projects");
}

export async function updateProject(
  input: ProjectFormInput,
): Promise<{ error: string } | undefined> {
  try {
    await requireAdmin();
    assertValidSlug(input.slug);
    const raw = buildProjectFileContent(input);
    await commitContentFile(
      `content/projects/${input.slug}.mdx`,
      raw,
      `feat: ${input.title} 프로젝트 수정`,
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
  redirect("/admin/projects");
}

export async function deleteProject(
  slug: string,
  title: string,
): Promise<{ error: string } | undefined> {
  try {
    await requireAdmin();
    assertValidSlug(slug);
    await deleteContentFile(
      `content/projects/${slug}.mdx`,
      `chore: ${title} 프로젝트 삭제`,
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
  redirect("/admin/projects");
}

export async function renderPreviewAction(body: string): Promise<ReactNode> {
  await requireAdmin();
  return <MdxRenderer source={body} />;
}

export async function uploadImage(
  formData: FormData,
): Promise<{ path: string } | { error: string }> {
  try {
    await requireAdmin();

    const kind = formData.get("kind");
    if (typeof kind !== "string" || !IMAGE_KINDS.has(kind)) {
      throw new Error(`올바르지 않은 업로드 대상입니다: ${kind}`);
    }

    const slug = formData.get("slug");
    if (typeof slug !== "string") throw new Error("slug가 없습니다");
    assertValidSlug(slug);

    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("업로드할 파일이 없습니다");

    const ext = IMAGE_MIME_EXT[file.type];
    if (!ext) {
      throw new Error(
        `지원하지 않는 이미지 형식입니다: ${file.type || "알 수 없음"} (png/jpeg/webp/gif만 허용)`,
      );
    }
    const nameExt = file.name.split(".").pop()?.toLowerCase();
    if (!nameExt || !ALLOWED_EXTENSIONS.has(nameExt)) {
      throw new Error(`지원하지 않는 파일 확장자입니다: .${nameExt ?? ""}`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(
        `이미지 용량이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB, 최대 5MB)`,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash8 = createHash("sha256").update(buffer).digest("hex").slice(0, 8);
    const filename = `${slug}-${hash8}.${ext}`;

    await commitImage(
      `public/images/${kind}/${filename}`,
      buffer.toString("base64"),
      `chore: 에디터 이미지 업로드 ${filename}`,
    );

    return { path: `/images/${kind}/${filename}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
}
