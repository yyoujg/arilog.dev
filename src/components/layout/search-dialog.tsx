"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Title, Description } from "@radix-ui/react-dialog";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { searchDocs, splitByQuery } from "@/lib/search";
import type { SearchDoc } from "@/types/post";
import { Button } from "@/components/ui/button";

// 질의어 조각을 <mark>로 강조.
function Highlight({ text, query }: { text: string; query: string }) {
  return splitByQuery(text, query).map((p, i) =>
    p.hit ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded-sm">
        {p.text}
      </mark>
    ) : (
      <span key={i}>{p.text}</span>
    ),
  );
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  // Cmd/Ctrl+K 토글.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // 인덱스는 첫 오픈 시 1회만 fetch. 초기 번들에 포함되지 않는다.
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    fetch("/search-index.json")
      .then((r) => r.json() as Promise<SearchDoc[]>)
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [open]);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  const onSelect = useCallback(
    (url: string) => {
      // 결과 선택 시점의 질의를 기록(키 입력마다 보내지 않는다).
      track("search_query", { search_term: query });
      onOpenChange(false);
      router.push(url);
    },
    [query, router],
  );

  const results = docs ? searchDocs(docs, query) : [];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="검색 (Cmd/Ctrl+K)"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-5" />
      </Button>

      <Command.Dialog
        open={open}
        onOpenChange={onOpenChange}
        label="사이트 검색"
        shouldFilter={false}
        loop
        overlayClassName="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        contentClassName="bg-popover text-popover-foreground border-border fixed top-[15vh] left-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        {/* Radix Dialog a11y: 시각적으로 숨긴 제목/설명(없으면 콘솔 경고). */}
        <Title className="sr-only">사이트 검색</Title>
        <Description className="sr-only">
          글 제목·본문을 검색합니다. 방향키로 이동, Enter로 이동, ESC로 닫기.
        </Description>

        <div className="border-border flex items-center gap-2 border-b px-4">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="글 검색…"
            className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
          />
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
          {loading && (
            <div className="text-muted-foreground px-3 py-6 text-center text-sm">
              불러오는 중…
            </div>
          )}

          {!loading && (
            <Command.Empty className="text-muted-foreground px-3 py-6 text-center text-sm">
              {query.trim() ? "검색 결과가 없습니다." : "검색어를 입력하세요."}
            </Command.Empty>
          )}

          {results.map(({ doc, snippet }) => (
            <Command.Item
              key={doc.slug}
              value={doc.slug}
              onSelect={() => onSelect(doc.url)}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-md px-3 py-2.5",
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  <Highlight text={doc.title} query={query} />
                </span>
                <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                  {doc.category}
                </span>
              </div>
              <span className="text-muted-foreground line-clamp-2 text-xs">
                <Highlight text={snippet} query={query} />
              </span>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
