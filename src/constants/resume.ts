import type { Resume } from "@/types/resume";
import { SITE } from "@/constants/site";

// 공개 사이트 기준. 회사명은 비공개로 일반화하고(호텔·숙박 도메인 SaaS 기업),
// 학력·자격증은 노출하지 않는다(빈 배열 → 섹션 미렌더).
const COMPANY = "호텔·숙박 도메인 SaaS 기업";

export const RESUME: Resume = {
  name: SITE.author,
  title: "프론트엔드 개발자",
  summary:
    "멀티테넌트 예약 SaaS와 운영 시스템을 0→1로 설계·구축하는 3년차 프론트엔드 개발자",
  skills: [
    {
      category: "Languages",
      items: ["JavaScript", "TypeScript", "HTML", "CSS"],
    },
    { category: "Frameworks", items: ["React", "Next.js"] },
    {
      category: "상태·폼",
      items: [
        "TanStack Query",
        "Recoil",
        "Jotai",
        "Zustand",
        "React Hook Form",
      ],
    },
    {
      category: "스타일링",
      items: [
        "Tailwind CSS",
        "cva",
        "tailwind-merge",
        "Material UI",
        "Emotion",
        "Styled Components",
      ],
    },
    {
      category: "빌드·테스트",
      items: [
        "Vite",
        "Vitest",
        "Playwright",
        "tsup",
        "Storybook",
        "size-limit",
      ],
    },
    {
      category: "분석·API",
      items: [
        "Google Analytics 4",
        "Google Tag Manager",
        "RESTful API",
        "OAuth",
      ],
    },
    {
      category: "품질·협업",
      items: ["ESLint", "Prettier", "Git", "GitLab", "Jira", "Figma"],
    },
    { category: "AI·인프라", items: ["OpenAI Codex", "Nginx"] },
  ],
  experience: [
    {
      company: COMPANY,
      role: "멀티테넌트 예약 SaaS · 프론트엔드 아키텍처 설계 · 단독 구축",
      period: "2026.04 ~ 재직중",
      description: [
        "하나의 코드베이스로 N개 시설의 예약 사이트를 서브도메인별로 제공하는 멀티테넌트 SaaS. 프레임워크 세팅부터 프론트엔드 전 영역을 단독으로 설계·구현했습니다.",
        "시설 간 차이를 설정 데이터로 분리하고 3단 deep-merge로 병합해, 신규 시설 추가 시 코드 변경 0줄",
        "요청 호스트를 서버에서 해석해 CSS 변수를 인라인 주입, 브랜딩 전환 시 FOUC 제거",
        "예약 식별정보를 AES-256-GCM 봉인 토큰(TTL 10분)으로 인계, URL 평문 노출 0",
        "BFF 프록시로 API 키 서버사이드 은닉, 외부 HTML 새니타이즈로 XSS 차단",
        "EasyPay 연동, 등록 실패 시 결제 자동 취소로 정합성 불일치 차단",
        "RSC + URL 상태 + 경량 Context 조합으로 설계, 핵심 로직 Vitest 커버",
      ],
    },
    {
      company: COMPANY,
      role: "사내 디자인 시스템 구축(AI 하네스 기반) · 디자인 토큰·컴포넌트 담당 + 에이전트 하네스 설계",
      period: "2026.06 ~ 재직중",
      description: [
        "사내 운영 시스템 공통 UI 디자인 시스템을 빈 레포에서 구축하는 이니셔티브.",
        "코드 생성 에이전트용 스킬 6종으로 생성 → 빌드 → 문서 → 번들측정을 강제 순서로 자동화",
        "tsup으로 별칭을 상대경로로 컴파일하고 CSS를 동봉해, 소비 측 설정 없이 import 2줄로 사용",
        "size-limit으로 brotli 6.9KB 실측, 한도 초과 시 CI에서 빌드 실패",
        "컴포넌트 2 → 4개 확장에도 번들 +0.19KB (tree-shaking 검증)",
        "컴포넌트 8종 — Button·Input·Dropdown·Badge·Modal·Toast·Tooltip·Popover",
        "Storybook play + axe로 접근성 위반 자동 검출",
        "base / semantic 2계층 토큰 구조, 컴포넌트는 semantic만 참조",
      ],
    },
    {
      company: COMPANY,
      role: "B2C 멤버십 리뉴얼 · 영역 담당 (인증 / 분석 / 다국어)",
      period: "2025.07 ~ 2026.04",
      description: [
        "Pages Router · Recoil · MUI 기반 레거시를 App Router로 전면 리뉴얼하며 인증·분석·다국어 영역을 담당했습니다.",
        "회사명·도메인 검색 기반 임직원 인증, 12개월 만료 판정과 재인증 플로우 구현",
        "GTM dataLayer 헬퍼 작성 및 이커머스 이벤트 정합성 수정",
        "전역 스피너를 섹션 단위 스켈레톤으로 분리, next/image webp 전환",
        "hydration mismatch를 마운트 가드로 해결",
      ],
    },
    {
      company: COMPANY,
      role: "B2C 서비스(리뉴얼 이전) · 핵심 개발자 · 단일 최대 기여자",
      period: "2024.01 ~ 2025.05",
      description: [
        "외주로 개발된 레거시 환경에서 회원·인증·예약·결제·마이페이지 전반을 담당하며 구조 개선을 주도했습니다.",
        "분산된 날짜 상태를 단일 모듈(29 atom/selector)로 중앙화, 중복 코드 1,854줄 제거",
        "Google Sheets API 연동으로 번역 반영을 자동화, 건당 5~10분 → 1분",
        "동시 다발 401을 인터셉터 큐로 직렬화해 리프레시 1회 후 일괄 재시도 (무중단 인증)",
        "iOS/Android 웹뷰와 토큰·로그인 양방향 동기화 브릿지 구현",
      ],
    },
    {
      company: COMPANY,
      role: "호텔 운영 어드민 신규 구축 · 단독 설계·구축 (1인 프론트엔드, 제로베이스)",
      period: "2023.07 ~ 2026.03",
      description: [
        "호텔 운영 전 도메인을 다루는 어드민을 제로베이스에서 단독 구축했습니다.",
        "50개 이상의 정책 조합을 정책 그룹으로 추상화하고 React Hook Form으로 UI 동적 개폐",
        "정책 간 제약(판매기간 < 투숙기간 등)을 입력 단계에서 사전 차단",
        "5단계 권한 체계를 라우팅 단위에서 재정의",
        "30+ 페이지 · 50+ API · 100+ 컴포넌트를 단일 모듈 구조로 유지",
      ],
    },
    {
      company: COMPANY,
      role: "호텔 운영 백오피스 · 운영 백오피스 개발 담당",
      period: "2025.05 ~ 재직중",
      description: [
        "예약·콘텐츠 관리 화면 개발, 반복 운영 업무 자동화",
        "공통 폼·테이블 컴포넌트로 화면 개발 생산성 향상",
        "API 통신 구조 표준화 및 상태 관리 개선",
      ],
    },
  ],
  // 공개 사이트에서는 학력·자격증을 노출하지 않는다(섹션 미렌더).
  education: [],
  certifications: [],
};
