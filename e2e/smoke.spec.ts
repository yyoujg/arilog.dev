import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

const VIEWPORTS = [375, 768, 1440];

// <p> 안에 들어오면 안 되는 블록 요소들. 있으면 브라우저가 <p>를 강제로 닫아
// SSR HTML과 클라이언트 DOM이 어긋나며 하이드레이션이 깨진다.
const BLOCK_IN_P =
  /<(?:figure|table|div|ul|ol|pre|section|article|blockquote|h[1-6]|hr|form|p)[\s/>]/i;

// 사이트맵에서 라우트(pathname)를 수집한다. 라우트를 하드코딩하지 않는다.
async function collectRoutes(page: Page): Promise<string[]> {
  const res = await page.request.get("/sitemap.xml");
  expect(res.status(), "sitemap.xml 응답").toBe(200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = locs.map((u) => new URL(u).pathname);
  return [...new Set(paths)].sort();
}

// 프레임워크가 dev에서만 내보내는 성능 조언(정확성/하이드레이션 문제 아님).
// 정말 무해한 것만 좁게 무시한다. 하이드레이션·나머지 경고는 그대로 실패시킨다.
const IGNORE_CONSOLE = [
  // next/image LCP 조언: 해당 이미지가 있는 모든 페이지에서 뜨는 dev 전용 힌트.
  /was detected as the Largest Contentful Paint/,
];

// 콘솔의 error/warning 과 미처리 예외를 수집한다(하이드레이션 경고 포함).
function watchConsole(page: Page): () => string[] {
  const msgs: string[] = [];
  const onConsole = (m: ConsoleMessage) => {
    const t = m.type();
    if (t !== "error" && t !== "warning") return;
    const text = m.text();
    if (IGNORE_CONSOLE.some((re) => re.test(text))) return;
    msgs.push(`[${t}] ${text}`);
  };
  const onError = (e: Error) => msgs.push(`[pageerror] ${e.message}`);
  page.on("console", onConsole);
  page.on("pageerror", onError);
  return () => {
    page.off("console", onConsole);
    page.off("pageerror", onError);
    return msgs;
  };
}

// 서버 렌더 HTML에서 <p> 안의 블록 요소 중첩을 찾는다.
// 브라우저가 DOM을 복구하기 전 원본 문자열을 검사해야 잡힌다.
function findBlockInP(html: string): string | null {
  for (const m of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const bad = m[1].match(BLOCK_IN_P);
    if (bad) return bad[0];
  }
  return null;
}

test("스모크: 사이트맵 전 라우트 순회", async ({ page }) => {
  const routes = await collectRoutes(page);
  expect(routes.length, "라우트 개수").toBeGreaterThan(0);

  const failures: string[] = [];

  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    const drain = watchConsole(page);

    let resp;
    try {
      resp = await page.goto(route, { waitUntil: "networkidle" });
    } catch (e) {
      drain();
      failures.push(`${route} — 네비게이션 실패: ${(e as Error).message}`);
      continue;
    }

    const status = resp?.status() ?? 0;
    if (status !== 200) failures.push(`${route} — HTTP ${status}`);

    // <p> 블록 중첩 (원본 SSR HTML 기준).
    const bad = findBlockInP((await resp?.text()) ?? "");
    if (bad) failures.push(`${route} — <p> 안에 블록 요소 중첩: ${bad}`);

    // 가로 오버플로우.
    for (const w of VIEWPORTS) {
      await page.setViewportSize({ width: w, height: 900 });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      if (overflow > 1)
        failures.push(`${route} @${w}px — 가로 오버플로우 ${overflow}px`);
    }

    // 하이드레이션 등 콘솔 경고/에러 (dev 모드에서만 관찰됨).
    for (const msg of drain()) failures.push(`${route} — ${msg}`);
  }

  expect(failures, `\n${failures.join("\n")}\n`).toEqual([]);
});

test("스모크: 검색 모달 키보드 조작", async ({ page }) => {
  const idxRes = await page.request.get("/search-index.json");
  expect(idxRes.status(), "search-index.json 응답").toBe(200);
  const idx = (await idxRes.json()) as Array<{ title: string }>;
  expect(idx.length, "인덱스 문서 수").toBeGreaterThan(0);
  // 첫 문서 제목 앞부분을 질의어로 쓴다(반드시 자기 자신은 매치된다).
  const term = idx[0].title.trim().split(/\s+/)[0].slice(0, 4);

  await page.goto("/");
  const before = page.url();

  await page.keyboard.press("ControlOrMeta+KeyK");
  const dialog = page.getByRole("dialog", { name: "사이트 검색" });
  await expect(dialog).toBeVisible();

  await dialog.getByPlaceholder("글 검색…").fill(term);
  await expect(dialog.locator("[cmdk-item]").first()).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(dialog).toBeHidden();
  // 동기 page.url() 대신 auto-retry 단언: 콜드 CI에선 대상 라우트 컴파일 탓에
  // 클라이언트 내비게이션이 지연돼 URL 갱신이 늦다(로컬 웜 캐시에선 즉시).
  await expect(page, "결과 선택 후 이동").not.toHaveURL(before);
});
