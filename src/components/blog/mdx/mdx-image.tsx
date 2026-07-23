import Image from "next/image";

interface MdxImageProps {
  src?: string;
  alt?: string;
  title?: string; // 마크다운 이미지 title -> 캡션 (블록일 때만)
  width?: number | string;
  height?: number | string;
  "data-block"?: string; // rehype-unwrap-images: 단독 줄 이미지
  "data-plain"?: string; // svg/remote: next/image 미사용
  "data-missing"?: string; // dev 폴백: 파일 없음/포맷 문제
}

function Figure({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  return (
    <figure className="not-prose my-6">
      {children}
      {caption && (
        <figcaption className="text-muted-foreground mt-2 text-center text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// 마크다운 이미지 override. 블록(data-block)이면 figure+figcaption,
// 인라인이면 figure/캡션 없이 img만. width/height는 rehype-image-size가 주입.
export function MdxImage({
  src = "",
  alt = "",
  title,
  width,
  height,
  "data-block": block,
  "data-plain": plain,
  "data-missing": missing,
}: MdxImageProps) {
  const isBlock = block === "true";

  // 인라인 이미지: <p> 안에 텍스트와 함께 있으므로 figure를 쓰면 안 된다.
  if (!isBlock) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className="inline-block h-auto max-w-full align-middle"
      />
    );
  }

  // dev 폴백: 누락/포맷 문제. 작성자가 놓치지 않게 경로를 노출한다.
  if (missing) {
    return (
      <Figure caption={title}>
        <div className="border-destructive/50 bg-destructive/10 text-muted-foreground flex min-h-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-center text-sm">
          <span className="text-destructive font-semibold">
            이미지를 찾을 수 없음
          </span>
          <code className="text-xs">{src}</code>
        </div>
      </Figure>
    );
  }

  // svg/remote: 크기 정보 없이 plain img (next/image 미사용).
  if (plain) {
    return (
      <Figure caption={title}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-auto w-full rounded-lg border"
        />
      </Figure>
    );
  }

  return (
    <Figure caption={title}>
      <Image
        src={src}
        alt={alt}
        width={Number(width)}
        height={Number(height)}
        className="h-auto w-full rounded-lg border"
        sizes="(max-width: 768px) 100vw, 768px"
      />
    </Figure>
  );
}
