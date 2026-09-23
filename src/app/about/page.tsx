import type { Metadata } from "next";
import Link from "next/link";

import { RESUME } from "@/constants/resume";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { Timeline } from "@/components/about/timeline";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Next.js·React로 멀티테넌트 예약 SaaS와 대규모 운영 시스템을 0→1로 설계·구축하는 4년차 프론트엔드 개발자입니다.",
  path: "/about",
});

const INTRO = [
  "4년차 프론트엔드 개발자입니다. React·TypeScript·Next.js를 중심으로 개발합니다.",
  "호텔 운영 어드민, 멀티테넌트 예약 SaaS, 사내 공통 디자인 시스템, 운영 백오피스를 제로베이스에서 설계·구축한 경험이 있습니다.",
  "어드민에서는 도메인마다 흩어진 취소·예약 정책 입력을 하나의 폼 구조로 모았고, 예약 SaaS에서는 결제 승인·예약 등록 간 실패 구간을 설계했고, 디자인 시스템에서는 번들 크기 게이트의 측정 범위 결함을 발견해 교체했습니다.",
  "저 혼자 빨라지는 것보다, 다음에 이 화면을 만들 사람이 빨라지는 구조를 만드는 데 관심이 있습니다.",
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
      "시설·패키지·다이닝 3개 도메인의 취소·예약 정책 입력(최상위 9필드, 중첩 포함 최대 22필드)을 RHF Nested·조건부 렌더링으로 구조화",
  },
  {
    label: "도구를 의심하고 검증하는 원칙",
    value:
      "size-limit 게이트가 컴포넌트 스텁 파일 하나만 재고 의존 청크를 집계하지 못하던 측정 범위 결함을 직접 발견해 측정 방식을 교체",
  },
];

// 본인 성과 실측치.
const METRICS = [
  {
    label: "단독 구축 규모",
    value: "호텔 운영 어드민 30+ 페이지 · 50+ API · 100+ 컴포넌트",
  },
  {
    label: "결함 발견",
    value:
      "size-limit 번들 게이트의 측정 범위 결함 발견·교체 (컴포넌트별 수십 배 언더카운트, 의존성 유무에 따라 편차)",
  },
  {
    label: "원인 규명",
    value:
      "신고된 증상과 반대 방향의 결함을 같은 코드에서 발견 — 판매 불가 날짜가 포함된 예약이 통과되던 날짜 경계 버그",
  },
  {
    label: "결제·보안",
    value:
      "결제·예약 상태 불일치를 판별해 재결제 유발 경로 차단 · 예약 식별정보 AES-256-GCM 봉인 토큰",
  },
  {
    label: "성능",
    value:
      "예약 페이지 성능 기준선 수립 후 레저 상세 CLS 0.440 → 0.074 (Lighthouse 합성 측정, 동일 조건 재측정)",
  },
  {
    label: "무코드 확장",
    value: "신규 시설 추가 시 코드 변경 없이 설정만으로 확장",
  },
];

const CAPABILITIES = [
  {
    area: "운영 어드민",
    detail:
      "대규모 관리자 화면 단독 설계 · 권한 라우팅 · 복합 폼 구조화 · 낙관적 잠금·부분 실패 처리",
  },
  {
    area: "디자인 시스템",
    detail:
      "2계층 토큰 · 컴포넌트 37종 · tsup 패키지화 · size-limit CI 게이트 · 소비 앱 CSS 통합",
  },
  {
    area: "도메인",
    detail: "운영 백오피스 · 멀티테넌트 SaaS · 예약/결제 · 인증 · 멤버십",
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
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
