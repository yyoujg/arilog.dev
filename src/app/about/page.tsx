import type { Metadata } from "next";

import { RESUME } from "@/constants/resume";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/about/timeline";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: `${RESUME.name} 소개.`,
  path: "/about",
});

// TODO: 실제 관심사로 교체
const INTERESTS = [
  "디자인 시스템",
  "웹 성능 최적화",
  "접근성",
  "개발자 경험(DX)",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-xl font-bold tracking-tight">{children}</h2>;
}

export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>

      <div className="mt-10 space-y-12">
        <section>
          <SectionTitle>소개</SectionTitle>
          <p className="leading-relaxed">{RESUME.summary}</p>
          {/* TODO: 더 긴 자기소개 문단으로 보강 */}
        </section>

        <section>
          <SectionTitle>기술 스택</SectionTitle>
          <div className="space-y-3">
            {RESUME.skills.map((group) => (
              <div key={group.category}>
                <h3 className="text-muted-foreground mb-1.5 text-sm font-semibold">
                  {group.category}
                </h3>
                <ul className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Badge variant="muted">{item}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>경력</SectionTitle>
          <Timeline items={RESUME.experience} />
        </section>

        <section>
          <SectionTitle>자격증</SectionTitle>
          <ul className="space-y-2">
            {RESUME.certifications.map((cert, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">{cert.name}</span>
                <span className="text-muted-foreground text-sm">
                  {cert.issuer} · {cert.date}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionTitle>관심사</SectionTitle>
          <ul className="flex flex-wrap gap-1.5">
            {INTERESTS.map((interest) => (
              <li key={interest}>
                <Badge variant="outline">{interest}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
