"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/admin/tag-input";
import { cn } from "@/lib/utils";

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

  // state로 들고 있지 않고 매 렌더 initial prop에서 직접 계산한다 — useState
  // 초깃값은 mount 시점에만 굳어, 같은 컴포넌트 인스턴스가 재사용될 경우(예:
  // 클라이언트 내비게이션) 이전 글의 값을 들고 있을 위험이 있다. props는
  // 항상 최신이므로 "지금 이 페이지가 로드한 글"과 절대 어긋나지 않는다.
  const originalSlug = initial?.slug.replace(/^posts\//, "") ?? "";
  const originalTitle = initial?.title ?? "";

  const [preview, setPreview] = useState<ReactNode>(null);
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isUploadPending, startUploadTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      startPreviewTransition(async () => {
        try {
          setPreview(await renderPreviewAction(withBlobs));
        } catch (e) {
          // requireAdmin() 실패(세션 만료 등)를 포함해 renderPreviewAction의
          // 어떤 예외도 폼 전체를 에러 바운더리로 무너뜨리지 않고 미리보기
          // 패널에만 표시한다. 서버측 인증 자체는 그대로 유지 — 여기선 안 삼키고
          // 화면만 지킨다.
          const isAuthError =
            e instanceof Error && e.message.includes("인증되지 않은 요청");
          setPreview(
            <p className="text-destructive text-sm">
              {isAuthError
                ? "세션이 만료되었습니다. 다시 로그인해주세요."
                : "미리보기를 불러올 수 없습니다."}
            </p>,
          );
        }
      });
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [body]);

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

  function handleBodyChange(next: string) {
    setBody(next);
  }

  function uploadFile(file: File) {
    if (!SLUG_PATTERN.test(slug)) {
      setUploadError(
        "이미지 업로드 전에 유효한 slug(kebab-case)를 먼저 입력하세요",
      );
      return;
    }
    setUploadError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    formData.append("kind", "posts");
    startUploadTransition(async () => {
      const result = await uploadImage(formData);
      if ("error" in result) {
        setUploadError(result.error);
        return;
      }
      uploadedBlobsRef.current.set(result.path, objectUrl);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const snippet = `![${alt}](${result.path})\n`;
      // 함수형 업데이트: 업로드는 비동기라 완료 시점의 body가 클릭 시점과
      // 다를 수 있다(타이핑 진행, 다른 이미지 업로드 완료 등). 클로저로 캡처한
      // body를 쓰면 그 사이 변경분을 통째로 덮어써 유실한다.
      setBody((prev) => prev + snippet);
    });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
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
        className="grid gap-8 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-8">
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
                placeholder="React, 트러블슈팅 (Enter로 추가)"
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

          <section className="border-border flex flex-col gap-4 border-t pt-6">
            <h2 className="text-muted-foreground text-sm font-semibold">
              본문
            </h2>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">MDX</Label>
                <label
                  className={
                    SLUG_PATTERN.test(slug)
                      ? "text-muted-foreground hover:text-foreground cursor-pointer text-xs underline underline-offset-4"
                      : "text-muted-foreground/50 cursor-not-allowed text-xs underline underline-offset-4"
                  }
                >
                  {isUploadPending ? "업로드 중..." : "이미지 업로드"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileInputChange}
                    disabled={isUploadPending || !SLUG_PATTERN.test(slug)}
                    className="sr-only"
                  />
                </label>
              </div>
              <p
                className={
                  SLUG_PATTERN.test(slug)
                    ? "text-muted-foreground text-xs"
                    : "text-destructive text-xs"
                }
              >
                {SLUG_PATTERN.test(slug)
                  ? "이미지는 배포 후 본문에 반영됩니다."
                  : "이미지 업로드 전에 유효한 slug(kebab-case)를 먼저 입력하세요."}
              </p>
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- objectURL은 next/image 최적화 대상이 아님
                <img
                  src={previewUrl}
                  alt="업로드한 이미지 미리보기"
                  className="border-border h-20 w-20 rounded-md border object-cover"
                />
              )}
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  className="min-h-[28rem] font-mono text-sm"
                  required
                />
              </div>
              {uploadError && (
                <p className="text-destructive text-sm">{uploadError}</p>
              )}
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
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-sm">
            미리보기{isPreviewPending && " (갱신 중...)"}
          </span>
          <div className="prose border-border max-w-none rounded-md border p-4">
            {preview}
          </div>
        </div>
      </form>
    </div>
  );
}
