import * as React from "react";

import { cn } from "@/lib/utils";

// Radix react-switch 없이 네이티브 checkbox로 구현 — 실제 상호작용 요소는
// sr-only input(키보드 Space 토글·포커스·checked 상태가 전부 네이티브)이고,
// 두 span은 시각 전용(aria-hidden)이라 접근성 트리를 어지럽히지 않는다.
// 바깥 래퍼는 label이어야 트랙/노브 클릭이 sr-only input까지 전달된다.
function Switch({
  className,
  id,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        data-slot="switch"
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        className="bg-input peer-checked:bg-primary peer-focus-visible:ring-ring/50 absolute inset-0 rounded-full transition-colors peer-focus-visible:ring-[3px] peer-disabled:opacity-50"
      />
      <span
        aria-hidden="true"
        className="bg-background pointer-events-none relative left-0.5 size-4 rounded-full shadow-xs transition-transform peer-checked:translate-x-4"
      />
    </label>
  );
}

export { Switch };
