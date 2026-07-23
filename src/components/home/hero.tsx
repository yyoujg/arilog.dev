import Link from "next/link";

import { RESUME } from "@/constants/resume";
import { SITE } from "@/constants/site";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@/components/common/brand-icons";

// 핵심 스택(히어로 노출용). 전체는 /about, /resume 참고.
const CORE_STACK = ["React", "Next.js", "TypeScript", "TailwindCSS"];

export function Hero() {
  return (
    <section className="py-20 sm:py-28">
      {/* LCP 요소: 이 h1 텍스트. 큰 이미지를 두지 않아 즉시 페인트된다. */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {RESUME.name}
      </h1>
      <p className="text-muted-foreground mt-3 text-xl">{RESUME.title}</p>
      <p className="mt-4 max-w-xl text-lg">{RESUME.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-1.5">
        {CORE_STACK.map((s) => (
          <li key={s}>
            <Badge variant="muted">{s}</Badge>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/resume" className={buttonVariants()}>
          Resume
        </Link>
        <a
          href={SITE.github}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          <GithubIcon className="size-4" /> GitHub
        </a>
        <Link href="/blog" className={buttonVariants({ variant: "outline" })}>
          Blog
        </Link>
      </div>
    </section>
  );
}
