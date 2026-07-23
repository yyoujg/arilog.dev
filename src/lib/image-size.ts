import fs from "node:fs";
import path from "node:path";

import { imageSize } from "image-size";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const RASTER = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"]);

export type ImageInfo =
  | { status: "ok"; width: number; height: number }
  | { status: "svg" } // 존재하지만 내재 크기가 없을 수 있어 plain img로 렌더
  | { status: "remote" } // http(s): 주입 스킵
  | { status: "missing"; resolved: string }
  | { status: "case"; resolved: string; actual: string } // 대소문자 불일치
  | { status: "unsupported"; resolved: string };

// 같은 이미지 반복 조회 방지 (src 기준 모듈 캐시).
const cache = new Map<string, ImageInfo>();

// public/ 아래를 실제 디렉터리 엔트리로 대소문자까지 정확히 대조한다.
// macOS(비구분)에서 통과하고 Linux(구분)에서 404 나는 걸 막기 위함.
function resolveExact(
  relParts: string[],
):
  | { kind: "found"; abs: string }
  | { kind: "case"; correctedRel: string; actual: string }
  | { kind: "missing" } {
  let dir = PUBLIC_DIR;
  const corrected: string[] = [];
  for (const part of relParts) {
    let entries: string[];
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return { kind: "missing" };
    }
    if (entries.includes(part)) {
      corrected.push(part);
      dir = path.join(dir, part);
      continue;
    }
    const ci = entries.find((e) => e.toLowerCase() === part.toLowerCase());
    if (ci) {
      return {
        kind: "case",
        correctedRel: [...corrected, ci].join("/"),
        actual: ci,
      };
    }
    return { kind: "missing" };
  }
  return { kind: "found", abs: dir };
}

export function inspectImage(src: string): ImageInfo {
  const cached = cache.get(src);
  if (cached) return cached;

  const info = compute(src);
  cache.set(src, info);
  return info;
}

function compute(src: string): ImageInfo {
  if (/^https?:\/\//.test(src)) return { status: "remote" };

  const relParts = src.replace(/^\//, "").split("/").filter(Boolean);
  const resolved = path.join(PUBLIC_DIR, ...relParts);
  const found = resolveExact(relParts);

  if (found.kind === "missing") return { status: "missing", resolved };
  if (found.kind === "case") {
    return { status: "case", resolved, actual: found.correctedRel };
  }

  const ext = path.extname(found.abs).toLowerCase();
  if (ext === ".svg") return { status: "svg" };
  if (!RASTER.has(ext)) return { status: "unsupported", resolved };

  try {
    const { width, height, orientation } = imageSize(
      fs.readFileSync(found.abs),
    );
    // EXIF orientation 5~8은 90/270도 회전 → 폭/높이 교환.
    const swap = orientation !== undefined && orientation >= 5;
    return {
      status: "ok",
      width: swap ? height : width,
      height: swap ? width : height,
    };
  } catch {
    return { status: "unsupported", resolved };
  }
}
