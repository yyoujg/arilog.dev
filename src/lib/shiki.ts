import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki";

const LANGS = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
  "bash",
  "css",
  "html",
  "md",
  "yaml",
] as const;

const THEMES = { light: "github-light", dark: "github-dark" } as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEMES.light, THEMES.dark],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

function normalizeLang(lang: string | undefined): BundledLanguage | "text" {
  const l = (lang ?? "").toLowerCase();
  return (LANGS as readonly string[]).includes(l)
    ? (l as BundledLanguage)
    : "text";
}

// "{1,3-5}" 또는 "1,3-5" -> Set<number>
export function parseHighlightLines(spec?: string): Set<number> {
  const set = new Set<number>();
  if (!spec) return set;
  for (const part of spec.replace(/[{}]/g, "").split(",")) {
    const range = part.trim().split("-").map(Number);
    if (range.length === 1 && Number.isInteger(range[0])) {
      set.add(range[0]);
    } else if (range.length === 2 && range.every(Number.isInteger)) {
      for (let i = range[0]; i <= range[1]; i++) set.add(i);
    }
  }
  return set;
}

export interface HighlightOptions {
  highlight?: string;
  showLineNumbers?: boolean;
}

export async function highlightCode(
  code: string,
  lang: string | undefined,
  { highlight, showLineNumbers }: HighlightOptions = {},
): Promise<string> {
  const highlighter = await getHighlighter();
  const highlightSet = parseHighlightLines(highlight);

  return highlighter.codeToHtml(code, {
    lang: normalizeLang(lang),
    themes: THEMES,
    defaultColor: false, // --shiki-light / --shiki-dark CSS 변수 출력
    transformers: [
      {
        pre(node) {
          if (showLineNumbers) this.addClassToHast(node, "line-numbers");
          // 배경은 code-bg 토큰으로 통일하기 위해 shiki 인라인 bg 제거
          if (node.properties) delete node.properties.style;
        },
        line(node, line) {
          if (highlightSet.has(line)) {
            this.addClassToHast(node, "line--highlighted");
          }
        },
      },
    ],
  });
}
