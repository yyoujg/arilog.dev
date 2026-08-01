import type { Metadata } from "next";
import Link from "next/link";

import { RESUME } from "@/constants/resume";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { Timeline } from "@/components/about/timeline";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Next.js·React로 멀티테넌트 예약 SaaS와 대규모 운영 시스템을 0→1로 설계·구축하는 3년차 프론트엔드 개발자입니다.",
  path: "/about",
});

const INTRO = [
  "결과값이 이상하다면, 도구 자체의 한계와 오류를 끝까지 의심하고 검증합니다.",
  "단순히 주어진 기능을 구현하는 것을 넘어, 시스템의 근본 원인을 파악하고 해결하는 프론트엔드 엔지니어입니다. 도구의 맹점이나 아키텍처의 빈틈을 찾아 안정성을 높이고, 디자인 시스템 구축부터 다국어 자동화까지 팀 생산성을 높이는 개발 환경을 설계하는 데 강점이 있습니다.",
  "React·TypeScript·Next.js 기반으로 예약·결제·멤버십·운영 플랫폼을 개발해왔습니다. 멀티테넌트 SaaS를 단독 구축했고, TanStack Query 기반 서버 상태 관리, GA4/GTM 데이터 수집, 대규모 관리자·고객 서비스 개발 경험을 보유하고 있습니다. 복잡한 운영 도메인을 빠르게 구조화하고, 레거시를 사용자 흐름 기준으로 재정리해 중복·정책 충돌을 구조로 제거합니다.",
];

// 대표 강점 3가지.
const STRENGTHS = [
  {
    label: "근거 있는 아키텍처 선택",
    value:
      "외부 상태 라이브러리 없이 RSC + URL + 경량 Context로 설계(App Router 정석), size-limit CI 가드로 번들 증가분을 정량 검증한 뒤에만 컴포넌트를 승인",
  },
  {
    label: "복잡한 도메인을 구조로 정리",
    value:
      "수십 가지 정책 토글 조합을 '정책 그룹'으로 추상화하고, RHF Nested·조건부·동적 배열로 복잡한 입력 UI를 구조화",
  },
  {
    label: "도구를 의심하고 검증하는 원칙",
    value:
      "size-limit 게이트가 진입점 파일만 측정해 실제 번들의 1/47만 재던 결함을 직접 발견해 측정 방식을 교체",
  },
];

// 본인 성과 실측치.
const METRICS = [
  { label: "중복 제거", value: "날짜 상태 중앙화로 중복 코드 1,854줄 제거" },
  { label: "자동화", value: "번역 반영 5~10분 → 1분" },
  { label: "토큰화", value: "디자인 토큰화로 하드코딩 120 → 6" },
  {
    label: "결함 발견",
    value: "size-limit 측정 결함(실제 번들의 1/47만 측정) 발견·수정",
  },
];

const CAPABILITIES = [
  {
    area: "프레임워크",
    detail: "Next.js(App Router) · React 19(RSC) · TypeScript(strict)",
  },
  {
    area: "상태·폼",
    detail: "TanStack Query · Recoil · Jotai · Zustand · React Hook Form",
  },
  {
    area: "스타일·시스템",
    detail: "Tailwind v4 · cva · tailwind-merge · Storybook · 디자인 토큰",
  },
  {
    area: "빌드·품질",
    detail:
      "Vite · Vitest · Playwright · tsup · size-limit · ESLint/Prettier · GitLab CI",
  },
  {
    area: "도메인",
    detail: "멀티테넌트 SaaS · 예약/결제 · 인증 · 멤버십 · 운영 어드민",
  },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-xl font-bold tracking-tight">{children}</h2>;
}

export default function AboutPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>

      <div className="mt-10 space-y-12">
        <section>
          <SectionTitle>소개</SectionTitle>
          <div className="space-y-4">
            {INTRO.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>핵심 강점</SectionTitle>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STRENGTHS.map((item) => (
              <div
                key={item.label}
                className="border-border rounded-lg border p-4"
              >
                <dt className="text-sm font-semibold">{item.label}</dt>
                <dd className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionTitle>대표 지표</SectionTitle>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="border-border rounded-lg border p-4"
              >
                <dt className="text-muted-foreground text-sm">
                  {metric.label}
                </dt>
                <dd className="mt-1 font-semibold">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionTitle>핵심 역량</SectionTitle>
          <dl className="divide-border divide-y">
            {CAPABILITIES.map((item) => (
              <div
                key={item.area}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4"
              >
                <dt className="text-muted-foreground w-32 shrink-0 text-sm">
                  {item.area}
                </dt>
                <dd className="text-sm">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionTitle>경력</SectionTitle>
          <Timeline items={RESUME.experience} />
          <Link
            href="/resume"
            className="text-muted-foreground hover:text-foreground mt-2 inline-block text-sm underline underline-offset-4 transition-colors"
          >
            전체 경력 상세는 이력서에서 확인하세요 →
          </Link>
        </section>
      </div>
    </Container>
  );
}
