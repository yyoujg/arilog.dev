"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import type { PostMeta } from "@/types/post";
import {
  createPost,
  updatePost,
  renderPreviewAction,
  uploadImage,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/admin/tag-input";
import { cn } from "@/lib/utils";

// CodeMirror는 브라우저 API에 의존한다. admin 라우트로 번들 영향을 국한하고
// SSR 시점 초기화를 피하기 위해 클라이언트 전용으로 로드한다.
const MdxEditor = dynamic(
  () => import("@/components/admin/mdx-editor").then((m) => m.MdxEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border-input bg-muted/30 text-muted-foreground flex h-[28rem] items-center justify-center rounded-md border text-sm">
        에디터 불러오는 중...
      </div>
    ),
  },
);

const PREVIEW_DEBOUNCE_MS = 400;
// 서버 assertValidSlug(src/lib/admin/actions.tsx)와 동일한 kebab-case 규칙.
const SLUG_PATTERN = /^[a-z0-9-]+$/;

// 영문 제목에서만 의미 있는 kebab-case를 뽑아낼 수 있다. 한글 제목은 로마자
// 변환 없이는 슬러그화가 불가능해 결과가 비어 있을 수 있다 — 그 경우 사용자가
// 직접 입력한다(항상 수동 편집 가능).
function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface PostFormProps {
  mode: "create" | "edit";
  initial?: PostMeta & { body: string };
  existingCategories?: string[];
}

export function PostForm({
  mode,
  initial,
  existingCategories = [],
}: PostFormProps) {
  const [slug, setSlug] = useState(initial?.slug.replace(/^posts\//, "") ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [series, setSeries] = useState(initial?.series ?? "");
  const [draft, setDraft] = useState(initial?.draft ?? false);
  const [body, setBody] = useState(initial?.body ?? "");
  const [attempted, setAttempted] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");

  // state로 들고 있지 않고 매 렌더 initial prop에서 직접 계산한다 — useState
  // 초깃값은 mount 시점에만 굳어, 같은 컴포넌트 인스턴스가 재사용될 경우(예:
  // 클라이언트 내비게이션) 이전 글의 값을 들고 있을 위험이 있다. props는
  // 항상 최신이므로 "지금 이 페이지가 로드한 글"과 절대 어긋나지 않는다.
  const originalSlug = initial?.slug.replace(/^posts\//, "") ?? "";
  const originalTitle = initial?.title ?? "";

  const [preview, setPreview] = useState<ReactNode>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 디바운스 타이머는 타이핑 중 겹치지 않지만, 실제 네트워크 요청(renderPreviewAction)
  // 자체는 느린 응답이 늦게 도착하면 최신 요청을 덮어쓸 수 있다. 매 요청에 토큰을
  // 매겨 응답 시점에 "여전히 최신 요청인지" 확인하고, 아니면 버린다.
  const previewTokenRef = useRef(0);

  const [uploadError, setUploadError] = useState<string | null>(null);
  // 커밋 경로(/images/posts/...) -> 이번 세션에 올린 objectURL. 배포 전
  // 미리보기에서만 쓰고, 저장되는 body 문자열엔 절대 섞이지 않는다.
  const uploadedBlobsRef = useRef<Map<string, string>>(new Map());

  // 언마운트 시 이번 세션에 만든 objectURL을 전부 해제한다. uploadedBlobsRef는
  // 재할당 없이 계속 같은 Map을 변형만 하므로, 마운트 시점에 참조를 잡아둬도
  // 언마운트 시점의 최신 내용을 그대로 가리킨다.
  useEffect(() => {
    const blobs = uploadedBlobsRef.current;
    return () => {
      for (const url of blobs.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  // body가 바뀔 때마다(타이핑, 이미지 업로드 완료) 디바운스 후 미리보기를 새로 렌더한다.
  // 항상 최신 body를 읽으므로, 업로드 완료 시점에 캡처해두는 stale closure가 없다.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      let withBlobs = body;
      for (const [path, blobUrl] of uploadedBlobsRef.current) {
        withBlobs = withBlobs.split(path).join(blobUrl);
      }
      const token = ++previewTokenRef.current;
      startPreviewTransition(async () => {
        try {
          const rendered = await renderPreviewAction(withBlobs);
          if (token !== previewTokenRef.current) return; // 늦게 도착한 응답 — 버린다
          setPreview(rendered);
          setPreviewError(null);
        } catch (e) {
          if (token !== previewTokenRef.current) return;
          // requireAdmin() 실패(세션 만료 등)를 포함해 renderPreviewAction의
          // 어떤 예외도 폼 전체를 에러 바운더리로 무너뜨리지 않고 마지막으로
          // 성공한 프리뷰는 유지한 채 에러만 인라인 표기한다.
          const isAuthError =
            e instanceof Error && e.message.includes("인증되지 않은 요청");
          setPreviewError(
            isAuthError
              ? "세션이 만료되었습니다. 다시 로그인해주세요."
              : "미리보기를 불러올 수 없습니다.",
          );
        }
      });
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [body]);

  // 저장 안 한 변경이 있는 상태에서 탭을 닫거나 새로고침하면 경고한다.
  // mount 직후 initial 값으로 인한 첫 렌더는 변경으로 치지 않는다.
  const mountedRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setIsDirty(true);
  }, [
    title,
    slug,
    description,
    date,
    category,
    tags,
    thumbnail,
    series,
    draft,
    body,
  ]);

  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function handleTitleChange(next: string) {
    setTitle(next);
    if (mode === "create" && !slugTouched) {
      setSlug(slugify(next));
    }
  }

  function handleSlugChange(next: string) {
    setSlugTouched(true);
    setSlug(next);
  }

  // MdxEditor에 넘기는 콜백 — 검증·업로드·objectURL 낙관적 프리뷰 등록까지
  // 여기서 처리하고, 실제 커서 위치 삽입/플레이스홀더 치환은 에디터가 맡는다.
  async function handleImageFile(file: File): Promise<string | null> {
    if (!SLUG_PATTERN.test(slug)) {
      setUploadError(
        "이미지 업로드 전에 유효한 slug(kebab-case)를 먼저 입력하세요",
      );
      return null;
    }
    setUploadError(null);
    const objectUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    formData.append("kind", "posts");
    const result = await uploadImage(formData);
    if ("error" in result) {
      URL.revokeObjectURL(objectUrl);
      setUploadError(result.error);
      return null;
    }
    uploadedBlobsRef.current.set(result.path, objectUrl);
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    return `![${alt}](${result.path})`;
  }

  function submit(confirmOverwrite: boolean) {
    setError(null);
    const input = {
      slug,
      title,
      description,
      date,
      category,
      tags,
      thumbnail: thumbnail || undefined,
      series: series || undefined,
      draft,
      body,
    };
    startSubmitTransition(async () => {
      const result =
        mode === "create"
          ? await createPost(input)
          : await updatePost(input, {
              originalSlug,
              originalTitle,
              confirmOverwrite,
            });
      if (result?.error) {
        setError(result.error);
        setConflict(Boolean(result.conflict));
      } else {
        setConflict(false);
        setIsDirty(false);
      }
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (tags.length === 0) {
      setError("최소 하나의 태그가 필요합니다");
      return;
    }
    if (
      draft &&
      !window.confirm("비공개(임시저장)로 저장됩니다. 계속할까요?")
    ) {
      return;
    }
    submit(false);
  }

  function handleConfirmOverwrite() {
    submit(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-background/95 border-border sticky top-0 z-10 flex items-center justify-between gap-4 border-b py-3 backdrop-blur">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-muted-foreground shrink-0 text-sm">
            {mode === "create" ? "새 글" : "글 수정"}
          </span>
          <span className="truncate font-semibold">{title || "제목 없음"}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {isSubmitPending && (
            <span className="text-muted-foreground text-xs">저장 중...</span>
          )}
          <Link
            href="/admin/posts"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            취소
          </Link>
          <Button type="submit" form="post-form" disabled={isSubmitPending}>
            {mode === "create" ? "게시" : "수정 저장"}
          </Button>
        </div>
      </div>

      <form
        id="post-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-8"
      >
        <div className="grid max-w-2xl gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-muted-foreground text-sm font-semibold">
              기본 정보
            </h2>
            <div className="grid gap-1.5">
              <Label htmlFor="title">title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="slug">
                slug (파일명){mode === "create" && " — 제목에서 자동 생성"}
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={mode === "edit"}
                pattern={SLUG_PATTERN.source}
                placeholder="my-new-post"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </section>

          <section className="border-border flex flex-col gap-4 border-t pt-6">
            <h2 className="text-muted-foreground text-sm font-semibold">
              메타
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="date">date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category">category</Label>
                <Input
                  id="category"
                  list="category-options"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
                <datalist id="category-options">
                  {existingCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tags">tags</Label>
              <TagInput
                id="tags"
                value={tags}
                onChange={setTags}
                placeholder="React, 트러블슈팅 (쉼표 또는 Enter로 추가)"
                className={cn(
                  attempted && tags.length === 0 && "border-destructive",
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="thumbnail">thumbnail (선택)</Label>
                <Input
                  id="thumbnail"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="/images/posts/..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="series">series (선택)</Label>
                <Input
                  id="series"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                />
              </div>
            </div>
            <div className="border-border flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex flex-col">
                <Label htmlFor="draft">공개 상태</Label>
                <span className="text-muted-foreground text-xs">
                  {draft ? "비공개(임시저장)" : "공개"}
                </span>
              </div>
              <Switch
                id="draft"
                checked={!draft}
                onChange={(e) => setDraft(!e.target.checked)}
              />
            </div>
          </section>
        </div>

        <section className="border-border flex flex-col gap-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-semibold">
              본문
            </h2>
            <div className="border-border flex gap-0.5 rounded-md border p-0.5 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileTab("write")}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs font-medium",
                  mobileTab === "write"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                쓰기
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs font-medium",
                  mobileTab === "preview"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                미리보기
              </button>
            </div>
          </div>

          <p
            className={
              SLUG_PATTERN.test(slug)
                ? "text-muted-foreground text-xs"
                : "text-destructive text-xs"
            }
          >
            {SLUG_PATTERN.test(slug)
              ? "이미지는 드롭·붙여넣기·툴바 삽입 시 레포에 바로 커밋됩니다."
              : "이미지 업로드 전에 유효한 slug(kebab-case)를 먼저 입력하세요."}
          </p>
          {uploadError && (
            <p className="text-destructive text-sm">{uploadError}</p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={cn(mobileTab !== "write" && "hidden lg:block")}>
              <MdxEditor
                value={body}
                onChange={setBody}
                onImageFile={handleImageFile}
              />
            </div>
            <div className={cn(mobileTab !== "preview" && "hidden lg:block")}>
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-sm">
                  미리보기{isPreviewPending && " (갱신 중...)"}
                </span>
                <div className="prose border-border h-[28rem] max-w-none overflow-y-auto rounded-md border p-4">
                  {previewError && (
                    <p className="text-destructive text-sm">{previewError}</p>
                  )}
                  {preview}
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3">
            <p className="text-destructive text-sm">{error}</p>
            {conflict && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmOverwrite}
                disabled={isSubmitPending}
              >
                그래도 저장
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
