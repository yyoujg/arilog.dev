import Link from "next/link";

import { SITE } from "@/constants/site";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button-variants";

export default function HomePage() {
  return (
    <Container className="py-24 sm:py-32">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {SITE.name}
        </h1>
        <p className="text-muted-foreground mt-6 text-lg">{SITE.description}</p>
        <div className="mt-8 flex gap-3">
          <Link href="/blog" className={buttonVariants()}>
            Blog
          </Link>
          <Link
            href="/projects"
            className={buttonVariants({ variant: "outline" })}
          >
            Projects
          </Link>
        </div>
      </div>
    </Container>
  );
}
