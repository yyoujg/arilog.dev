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

import type { PostMeta } from "@/types/post";
import {
  createPost,
  updatePost,
  renderPreviewAction,
  uploadImage,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const PREVIEW_DEBOUNCE_MS = 400;
// 서버 assertValidSlug(src/lib/admin/actions.tsx)와 동일한 kebab-case 규칙.
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface PostFormProps {
  mode: "create" | "edit";
  initial?: PostMeta & { body: string };
}

export function PostForm({ mode, initial }: PostFormProps) {
  const [slug, setSlug] = useState(initial?.slug.replace(/^posts\//, "") ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [series, setSeries] = useState(initial?.series ?? "");
  const [draft, setDraft] = useState(initial?.draft ?? true);
  const [body, setBody] = useState(initial?.body ?? "");

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      slug,
      title,
      description,
      date,
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      thumbnail: thumbnail || undefined,
      series: series || undefined,
      draft,
      body,
    };
    startSubmitTransition(async () => {
      const action = mode === "create" ? createPost : updatePost;
      const result = await action(input);
      if (result?.error) setError(result.error);
    });
  }

  const slugValid = SLUG_PATTERN.test(slug);

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="slug">slug (파일명)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={mode === "edit"}
            pattern={SLUG_PATTERN.source}
            placeholder="my-new-post"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="title">title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="tags">tags (콤마로 구분)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="React, 트러블슈팅"
            required
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
        <Label htmlFor="draft" className="w-fit">
          <input
            id="draft"
            type="checkbox"
            checked={draft}
            onChange={(e) => setDraft(e.target.checked)}
            className="size-4"
          />
          draft
        </Label>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">본문 (MDX)</Label>
            <label
              className={
                slugValid
                  ? "text-muted-foreground hover:text-foreground cursor-pointer text-xs underline underline-offset-4"
                  : "text-muted-foreground/50 cursor-not-allowed text-xs underline underline-offset-4"
              }
            >
              {isUploadPending ? "업로드 중..." : "이미지 업로드"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileInputChange}
                disabled={isUploadPending || !slugValid}
                className="sr-only"
              />
            </label>
          </div>
          <p
            className={
              slugValid
                ? "text-muted-foreground text-xs"
                : "text-destructive text-xs"
            }
          >
            {slugValid
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

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={isSubmitPending}>
          {isSubmitPending
            ? "저장 중..."
            : mode === "create"
              ? "게시"
              : "수정 저장"}
        </Button>
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
  );
}
