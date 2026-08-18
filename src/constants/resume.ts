import type { Resume } from "@/types/resume";
import { SITE } from "@/constants/site";

// 공개 사이트 기준. 회사명은 비공개로 일반화하고(호텔·숙박 도메인 SaaS 기업),
// 학력·자격증은 노출하지 않는다(빈 배열 → 섹션 미렌더).
const COMPANY = "호텔·숙박 도메인 SaaS 기업";

export const RESUME: Resume = {
  name: SITE.author,
  title: "프론트엔드 개발자",
  summary:
    "Next.js·React로 멀티테넌트 예약 SaaS와 대규모 운영 시스템을 0→1로 설계·구축하는 4년차 프론트엔드 개발자",
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
    { category: "인프라", items: ["Nginx"] },
  ],
  experience: [
    {
      company: COMPANY,
      role: "멀티테넌트 예약 SaaS · 프론트엔드 아키텍처 설계 · 단독 구축",
      period: "2026.04 ~ 재직중",
      description: [
        "하나의 코드베이스로 N개 시설의 예약 사이트를 서브도메인별로 제공하는 멀티테넌트 SaaS. 초기 세팅 단계부터 프론트엔드 전 영역을 단독으로 담당했습니다.",
        "시설 간 차이를 설정 데이터로 분리하고 3단 deep-merge로 병합해, 신규 시설 추가 시 코드 변경 없이 확장",
        "요청 호스트를 서버에서 해석해 CSS 변수를 인라인 주입, 초기 렌더에서 브랜드 색이 깜빡이지 않도록 처리",
        "예약 식별정보를 AES-256-GCM 봉인 토큰(TTL 10분)으로 인계, URL 쿼리 노출 제거",
        "BFF 프록시로 API 키 서버사이드 은닉, 외부 HTML 새니타이즈로 XSS 차단",
        "EasyPay 연동. 등록 실패 시 서버가 결제 승인을 취소하고, 프론트는 취소 완료 여부까지 판별해 \"결제 실패\"와 \"결제됨·예약 실패\"를 분리 안내 — 두 상태를 뭉치면 이미 결제한 사용자가 재결제를 시도합니다",
        "RSC + URL 상태 + 경량 Context 조합으로 설계, 핵심 로직 Vitest 커버",
      ],
    },
    {
      company: COMPANY,
      role: "사내 디자인 시스템 구축 · 디자인 토큰·컴포넌트 담당 + 빌드 자동화 스크립트 설계",
      period: "2026.06 ~ 재직중",
      description: [
        "사내 운영 시스템 공통 UI 디자인 시스템을 빈 레포에서 구축하는 이니셔티브.",
        "코드 생성 에이전트용 스킬 6종으로 생성 → 빌드 → 문서 → 번들측정을 강제 순서로 자동화",
        "tsup으로 별칭을 상대경로로 컴파일하고 CSS를 동봉해, 소비 측 설정 없이 import 2줄로 사용",
        "size-limit 게이트의 측정 범위 결함을 발견했습니다. 다중 entry 빌드에서 컴포넌트 파일이 청크를 re-export만 하는 스텁이 되어, 게이트가 그 스텁 하나만 재고 의존 청크를 집계하지 못하고 있었습니다. preset-small-lib로 측정 방식을 교체해 게이트 8개를 실측 기준으로 재설계했고, 팀에 공유됐던 수치가 실제와 무관했음을 밝혔습니다.",
        "컴포넌트 8종 — Button·Input·Dropdown·Badge·Modal·Toast·Tooltip·Popover",
        "Storybook play + axe로 접근성 위반 자동 검출",
        "base / semantic 2계층 토큰 구조, 컴포넌트는 semantic만 참조",
        "컴포넌트 생성 하네스 PoC를 설계한 뒤 역할을 분담해 통합했습니다.",
      ],
    },
    {
      company: COMPANY,
      role: "B2C 멤버십 리뉴얼 · 영역 담당 (인증 / 분석 / 다국어)",
      period: "2025.07 ~ 2026.04",
      description: [
        "Pages Router · Recoil · MUI 기반 레거시를 App Router로 전면 리뉴얼하며 인증·분석·다국어 영역을 담당했습니다.",
        "회사명·도메인 검색 기반 임직원 인증, 서버 만료일 기준 만료 안내와 재인증·일반회원 전환 플로우 구현",
        "GTM dataLayer 헬퍼 작성 및 이커머스 이벤트 정합성 수정",
        "메인 5개 섹션의 전역 스피너를 섹션 스켈레톤으로 분리하고, 뷰포트 진입 전까지 자리를 잡아두도록 처리",
        "hydration mismatch를 마운트 가드로 해결",
      ],
    },
    {
      company: COMPANY,
      role: "B2C 예약 서비스(별도 코드베이스) · 예약 검색·날짜 선택 영역 담당",
      period: "2024.04 ~ 재직중",
      description: [
        "주력 서비스와는 별도 레포·별도 배포 파이프라인을 쓰는 B2C 예약 사이트에서 검색·날짜 선택 영역을 담당했습니다.",
        "\"검색 캘린더에서 체크아웃 날짜가 선택되지 않는다\"로 접수된 건을 따라가다, 같은 코드에서 막혀야 하는데 안 막히는 반대 방향의 결함을 찾았습니다. 공용 날짜 유틸이 \"yyyy-MM-dd\" 문자열을 UTC 자정으로 해석해 캘린더 쪽 로컬 자정 기준과 9시간 어긋나 있었고, 그래서 판매 불가 날짜가 포함된 예약이 그대로 통과하고 있었습니다.",
        "문자열 입력만 로컬 자정으로 맞추도록 유틸 앞단을 고치고, 그 유틸을 쓰는 호출부를 전부 훑어 회귀가 없는지 확인",
        "클릭이 거부돼도 캘린더 라이브러리 내부 focus만 진행되던 문제는 리마운트로 초기화",
        "코드 리뷰를 계기로 같은 영역의 파생 결함 4건을 하루 안에 순차 해결 - 숙박 일수 미갱신, 딥링크 진입 후 재조회 누락, 체크아웃 당일까지 판매불가 검사에 포함, React Query 키 고정으로 인한 캐시 혼선",
      ],
    },
    {
      company: COMPANY,
      role: "B2C 서비스(리뉴얼 이전) · 핵심 개발자",
      period: "2024.01 ~ 2025.05",
      description: [
        "외주로 개발된 레거시 환경에서 회원·인증·예약·결제·마이페이지 전반을 담당하며 구조 개선을 주도했습니다.",
        "여러 컴포넌트에 분산·미동기화되어 있던 날짜 상태를 단일 모듈로 중앙화하고 props drilling 제거",
        "Google Sheets API 연동으로 번역 반영 스크립트를 구축해 운영팀 수작업을 대체",
        "동시 다발 401을 인터셉터 큐로 직렬화해 리프레시 1회 후 일괄 재시도하도록 개선",
        "iOS/Android 웹뷰와 토큰·로그인 양방향 동기화 브릿지 구현",
        "상품마감·요금재고 화면을 2024년에 설계했다가 2025년에 다시 설계했습니다. 3개 API 순차 호출 구조라 호출 순서가 곧 조회 방향이었고 첫 값 자동 선택이 전체 조회를 막고 있어, 단일 API에 방향 파라미터를 두어 양방향 조회로 바꿨습니다",
      ],
    },
    {
      company: COMPANY,
      role: "호텔 운영 어드민 신규 구축 · 단독 설계·구축 (1인 프론트엔드, 제로베이스)",
      period: "2023.07 ~ 2026.03",
      description: [
        "호텔 운영 전 도메인을 다루는 어드민을 제로베이스에서 단독 구축했습니다.",
        "시설·패키지·다이닝 3개 도메인에 흩어진 취소·예약 정책 입력(최상위 9필드, 중첩 포함 최대 22필드)을 React Hook Form Nested·조건부 렌더링으로 구조화",
        "등록 시 필수 항목 누락을 사전 체크하고, 날짜 필드에 minDate/maxDate 입력 제약을 걸어 정책 간 제약 위반을 차단",
        "5단계 운영자 권한 체계를 라우팅 단위에서 재정의",
        "30+ 페이지 · 50+ API · 100+ 컴포넌트를 단일 모듈 구조로 유지",
      ],
    },
    {
      company: COMPANY,
      role: "사내 Portal 시스템 · 어드민 이관 · 모노레포 전환 설계",
      period: "2025.06 ~ 2025.11",
      description: [
        "별도 시스템으로 운영되던 예약 백오피스를 사내 Portal 시스템으로 이관하는 프로젝트에 참여했습니다 (3인 팀, 시설 관리 메뉴 담당).",
        "화면을 그대로 옮기면 두 시스템의 코드 컨벤션이 섞이므로, 이관 대상 소스를 먼저 분석해 컨벤션을 파악했습니다.",
        "시설 관리(브랜드별 목록·등록/수정 라우팅·호텔그룹 필터링) 메뉴를 그 컨벤션에 맞춰 재구현",
        "이관 후에도 대상 코드베이스의 일관성이 유지돼, 다른 개발자가 같은 패턴으로 이어받을 수 있게 했습니다.",
        "이후 같은 Portal 시스템의 모노레포 전환 구조를 설계해 실행 가능한 형태로 제출했습니다. 개별로 흩어져 있던 운영 앱 6종을 yarn workspaces 단일 저장소로 묶고, 공통 컴포넌트·유틸·타입을 별도 패키지로 분리했습니다 — 한 번의 명령으로 전체를 실행하고 아이콘 번들 생성까지 자동화했습니다.",
      ],
    },
  ],
  // 공개 사이트에서는 학력·자격증을 노출하지 않는다(섹션 미렌더).
  education: [],
  certifications: [],
};
