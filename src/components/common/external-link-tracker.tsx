"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

// 외부 링크 클릭을 문서 레벨 위임으로 한 곳에서 집계한다.
// 링크 컴포넌트들(footer/MdxLink 등)을 일일이 client로 바꾸지 않기 위한 선택.
export function ExternalLinkTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!href || !/^https?:\/\//i.test(href)) return;
      try {
        const url = new URL(href);
        if (url.hostname === window.location.hostname) return; // 내부 링크 제외
        track("external_link_click", {
          link_url: href,
          link_domain: url.hostname,
        });
      } catch {
        // 파싱 불가한 href는 무시
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
