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
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // previewUrl이 바뀌거나 언마운트될 때 이전 objectURL을 해제한다.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleBodyChange(next: string) {
    setBody(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startPreviewTransition(async () => {
        setPreview(await renderPreviewAction(next));
      });
    }, PREVIEW_DEBOUNCE_MS);
  }

  function insertAtCursor(snippet: string) {
    const el = bodyRef.current;
    if (!el) {
      handleBodyChange(body + snippet);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + snippet + body.slice(end);
    handleBodyChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + snippet.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function uploadFile(file: File) {
    setUploadError(null);
    setPreviewUrl(URL.createObjectURL(file));
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
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      insertAtCursor(`![${alt}](${result.path})\n`);
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
            pattern="[a-z0-9\-]+"
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
            <label className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline underline-offset-4">
              {isUploadPending ? "업로드 중..." : "이미지 업로드"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileInputChange}
                disabled={isUploadPending}
                className="sr-only"
              />
            </label>
          </div>
          <p className="text-muted-foreground text-xs">
            이미지는 배포 후 본문에 반영됩니다.
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
              ref={bodyRef}
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
