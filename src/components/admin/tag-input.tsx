"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const tag = draft.trim();
    setDraft("");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div
      className={cn(
        "border-input bg-background focus-within:border-ring focus-within:ring-ring/50 flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 focus-within:ring-[3px]",
        className,
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 py-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`${tag} 태그 삭제`}
            className="hover:text-destructive"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}
