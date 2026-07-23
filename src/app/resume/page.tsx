import type { Metadata } from "next";

import { RESUME } from "@/constants/resume";
import { SITE } from "@/constants/site";
import { getAllProjects } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { ResumePrintButton } from "@/components/resume/resume-print-button";

export const metadata: Metadata = buildMetadata({
  title: "Resume",
  description: `${RESUME.name} 이력서.`,
  path: "/resume",
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-border mb-4 border-b pb-1 text-lg font-bold tracking-tight">
      {children}
    </h2>
  );
}

export default function ResumePage() {
  const projects = getAllProjects();

  return (
    <Container className="resume-root max-w-3xl py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{RESUME.name}</h1>
          <p className="text-muted-foreground mt-1">{RESUME.title}</p>
          <p className="mt-3 max-w-prose">{RESUME.summary}</p>
          <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
              {SITE.email}
            </a>
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              {SITE.github.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
        <ResumePrintButton />
      </header>

      <div className="mt-10 space-y-10">
        <section>
          <SectionTitle>기술 스택</SectionTitle>
          <dl className="space-y-2">
            {RESUME.skills.map((group) => (
              <div
                key={group.category}
                className="flex flex-col gap-1 sm:flex-row"
              >
                <dt className="text-muted-foreground w-28 shrink-0 text-sm">
                  {group.category}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge key={item} variant="muted">
                      {item}
                    </Badge>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionTitle>경력</SectionTitle>
          <div className="space-y-6">
            {RESUME.experience.map((exp, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-semibold">{exp.company}</h3>
                  <span className="text-muted-foreground text-sm">
                    {exp.period}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{exp.role}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {exp.description.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>프로젝트</SectionTitle>
          <div className="space-y-6">
            {projects.map((p) => (
              <div key={p.slug} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-semibold">{p.title}</h3>
                  <span className="text-muted-foreground text-sm">
                    {p.period}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{p.role}</p>
                <p className="mt-1 text-sm">{p.summary}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <li key={s}>
                      <Badge variant="outline">{s}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>교육</SectionTitle>
          <div className="space-y-4">
            {RESUME.education.map((edu, i) => (
              <div
                key={i}
                className="flex break-inside-avoid flex-wrap items-baseline justify-between gap-x-3"
              >
                <div>
                  <h3 className="font-semibold">{edu.school}</h3>
                  <p className="text-muted-foreground text-sm">{edu.degree}</p>
                </div>
                <span className="text-muted-foreground text-sm">
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>자격증</SectionTitle>
          <ul className="space-y-2">
            {RESUME.certifications.map((cert, i) => (
              <li
                key={i}
                className="flex break-inside-avoid flex-wrap items-baseline justify-between gap-x-3"
              >
                <span className="font-semibold">
                  {cert.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    · {cert.issuer}
                  </span>
                </span>
                <span className="text-muted-foreground text-sm">
                  {cert.date}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
