"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror, {
  EditorView,
  keymap,
  Prec,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "next-themes";
import {
  Bold,
  Italic,
  Link2,
  Code,
  SquareCode,
  Heading2,
  Heading3,
  List,
  Quote,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MdxEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageFile: (file: File) => Promise<string | null>;
  disabled?: boolean;
  className?: string;
}

function wrapSelection(view: EditorView, marker: string) {
  const { from, to } = view.state.selection.main;
  const before = view.state.sliceDoc(Math.max(0, from - marker.length), from);
  const after = view.state.sliceDoc(to, to + marker.length);
  if (before === marker && after === marker) {
    view.dispatch({
      changes: [
        { from: from - marker.length, to: from, insert: "" },
        { from: to, to: to + marker.length, insert: "" },
      ],
      selection: { anchor: from - marker.length, head: to - marker.length },
    });
  } else {
    view.dispatch({
      changes: [
        { from, insert: marker },
        { from: to, insert: marker },
      ],
      selection: { anchor: from + marker.length, head: to + marker.length },
    });
  }
  view.focus();
  return true;
}

function toggleLinePrefix(view: EditorView, prefix: string) {
  const line = view.state.doc.lineAt(view.state.selection.main.from);
  const hasPrefix = line.text.startsWith(prefix);
  view.dispatch({
    changes: hasPrefix
      ? { from: line.from, to: line.from + prefix.length, insert: "" }
      : { from: line.from, insert: prefix },
  });
  view.focus();
  return true;
}

function toggleCodeBlock(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const fenced = /^```\n[\s\S]*\n```$/.test(selected);
  if (fenced) {
    const inner = selected.slice(4, -4);
    view.dispatch({
      changes: { from, to, insert: inner },
      selection: { anchor: from, head: from + inner.length },
    });
  } else {
    const before = "```\n";
    const after = "\n```";
    view.dispatch({
      changes: { from, to, insert: `${before}${selected}${after}` },
      selection: {
        anchor: from + before.length,
        head: from + before.length + selected.length,
      },
    });
  }
  view.focus();
  return true;
}

function insertLink(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to) || "링크 텍스트";
  const url = window.prompt("링크 URL을 입력하세요", "https://");
  if (url === null) return true;
  view.dispatch({
    changes: { from, to, insert: `[${selected}](${url})` },
    selection: { anchor: from + 1, head: from + 1 + selected.length },
  });
  view.focus();
  return true;
}

function insertAtCursor(view: EditorView, text: string) {
  const { from, to } = view.state.selection.main;
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  });
}

function replaceInDoc(view: EditorView, search: string, replacement: string) {
  const doc = view.state.doc.toString();
  const idx = doc.indexOf(search);
  if (idx === -1) return;
  view.dispatch({
    changes: { from: idx, to: idx + search.length, insert: replacement },
  });
}

// 드롭·붙여넣기·툴바 버튼 공용 업로드 흐름. 컴포넌트 바깥의 순수 모듈 함수라
// render 단계에서 절대 호출되지 않는다(전부 이벤트 콜백에서만 호출) — Math.random
// 같은 비순수 호출을 컴포넌트 본문에 두면 걸리는 react-hooks/purity 린트를
// 피하는 구조적인 방법이기도 하다.
async function runImageUpload(
  view: EditorView,
  file: File,
  onImageFile: (file: File) => Promise<string | null>,
) {
  const token = `__uploading_${Math.random().toString(36).slice(2, 10)}__`;
  const placeholder = `![업로드 중...](${token})`;
  insertAtCursor(view, placeholder);
  const markdownSnippet = await onImageFile(file);
  replaceInDoc(
    view,
    placeholder,
    markdownSnippet ? `${markdownSnippet}\n` : "",
  );
}

const TOOLBAR_ITEMS = [
  {
    label: "굵게 (⌘B)",
    icon: Bold,
    run: (v: EditorView) => wrapSelection(v, "**"),
  },
  {
    label: "기울임 (⌘I)",
    icon: Italic,
    run: (v: EditorView) => wrapSelection(v, "_"),
  },
  { label: "링크 (⌘K)", icon: Link2, run: insertLink },
  {
    label: "인라인 코드",
    icon: Code,
    run: (v: EditorView) => wrapSelection(v, "`"),
  },
  { label: "코드 블록", icon: SquareCode, run: toggleCodeBlock },
  {
    label: "제목 2",
    icon: Heading2,
    run: (v: EditorView) => toggleLinePrefix(v, "## "),
  },
  {
    label: "제목 3",
    icon: Heading3,
    run: (v: EditorView) => toggleLinePrefix(v, "### "),
  },
  {
    label: "목록",
    icon: List,
    run: (v: EditorView) => toggleLinePrefix(v, "- "),
  },
  {
    label: "인용",
    icon: Quote,
    run: (v: EditorView) => toggleLinePrefix(v, "> "),
  },
] as const;

const EDITOR_EXTENSIONS = [
  markdown({ codeLanguages: languages }),
  Prec.highest(
    keymap.of([
      { key: "Mod-b", run: (v) => wrapSelection(v, "**") },
      { key: "Mod-i", run: (v) => wrapSelection(v, "_") },
      { key: "Mod-k", run: insertLink },
    ]),
  ),
];

export function MdxEditor({
  value,
  onChange,
  onImageFile,
  disabled,
  className,
}: MdxEditorProps) {
  const { resolvedTheme } = useTheme();
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<EditorView | null>(null);

  // 이미지 드롭·붙여넣기는 CodeMirror의 extensions(useMemo 대상)이 아니라
  // 별도 effect에서 네이티브 DOM 리스너로 건다 — extensions 배열에 넣으면
  // onImageFile이 바뀔 때마다(부모 리렌더마다) CodeMirror가 재구성되어
  // 커서/undo 히스토리가 흔들릴 수 있다. effect는 view.dom에 리스너만
  // 갈아끼우므로 에디터 상태에 영향이 없다.
  useEffect(() => {
    if (!view) return;
    function handleDrop(event: DragEvent) {
      const file = event.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      event.preventDefault();
      void runImageUpload(view!, file, onImageFile);
    }
    function handlePaste(event: ClipboardEvent) {
      const file = Array.from(event.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      event.preventDefault();
      void runImageUpload(view!, file, onImageFile);
    }
    const dom = view.dom;
    dom.addEventListener("drop", handleDrop);
    dom.addEventListener("paste", handlePaste);
    return () => {
      dom.removeEventListener("drop", handleDrop);
      dom.removeEventListener("paste", handlePaste);
    };
  }, [view, onImageFile]);

  const theme = useMemo(
    () => (resolvedTheme === "dark" ? oneDark : undefined),
    [resolvedTheme],
  );

  function handleToolbarClick(run: (view: EditorView) => boolean) {
    if (view) run(view);
  }

  function handleToolbarImageClick() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && view) void runImageUpload(view, file, onImageFile);
  }

  return (
    <div className={cn("border-input rounded-md border", className)}>
      <div className="border-input flex flex-wrap items-center gap-0.5 border-b p-1">
        {TOOLBAR_ITEMS.map(({ label, icon: Icon, run }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={() => handleToolbarClick(run)}
          >
            <Icon />
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="이미지 삽입"
          title="이미지 삽입"
          disabled={disabled}
          onClick={handleToolbarImageClick}
        >
          <ImageIcon />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <CodeMirror
        ref={cmRef}
        value={value}
        onChange={onChange}
        onCreateEditor={(v) => setView(v)}
        editable={!disabled}
        theme={theme}
        extensions={EDITOR_EXTENSIONS}
        height="28rem"
        className="text-sm"
      />
    </div>
  );
}
