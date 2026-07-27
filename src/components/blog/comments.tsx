"use client";

import { useEffect, useRef, useState } from "react";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

import { clientEnv } from "@/lib/env.client";

// 댓글은 스크롤이 근처에 왔을 때만 마운트한다(IntersectionObserver).
// giscus iframe·스크립트는 마운트 시점에 로드되므로 초기 로드에 포함되지 않는다.
export function Comments() {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const giscus = clientEnv.giscus;

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // 환경변수 미설정 시 댓글 영역 자체를 렌더하지 않는다.
  if (!giscus) return null;

  return (
    <section ref={ref} className="border-border mt-16 border-t pt-8">
      <h2 className="sr-only">댓글</h2>
      {visible && (
        <Giscus
          repo={giscus.repo}
          repoId={giscus.repoId}
          category={giscus.category}
          categoryId={giscus.categoryId}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          // 테마 prop이 바뀌면 @giscus/react가 iframe에 postMessage로 반영한다.
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          lang="ko"
          loading="lazy"
        />
      )}
    </section>
  );
}
