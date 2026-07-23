import type { Resume } from "@/types/resume";
import { SITE } from "@/constants/site";

// 스킬은 이 사이트가 실제로 쓰는 검증 가능한 스택으로 채운다.
// 경력/교육/자격증의 구체 값은 // TODO — 실제 정보로 직접 교체한다(날조 금지).
export const RESUME: Resume = {
  name: SITE.author,
  title: "프론트엔드 개발자",
  // TODO: 실제 자기소개 문구로 교체
  summary:
    "3년차 프론트엔드 개발자. 사용자 경험과 코드 품질을 함께 고민합니다.",
  skills: [
    {
      category: "Language",
      items: ["TypeScript", "JavaScript", "HTML", "CSS"],
    },
    {
      category: "Framework",
      items: ["React", "Next.js", "React Router"],
    },
    {
      category: "Styling",
      items: ["TailwindCSS", "shadcn/ui", "CSS Modules"],
    },
    {
      category: "Tooling",
      items: ["Vite", "Turbopack", "ESLint", "Prettier", "Vitest"],
    },
    { category: "Infra", items: ["Vercel", "GitHub Actions"] },
  ],
  experience: [
    // TODO: 실제 경력으로 교체
    {
      company: "TODO: 회사명",
      role: "프론트엔드 개발자",
      period: "TODO: YYYY.MM - YYYY.MM",
      description: [
        "TODO: 담당 업무와 성과(문제-해결-효과)를 정량 지표와 함께 작성",
      ],
    },
  ],
  education: [
    // TODO: 실제 학력으로 교체
    {
      school: "TODO: 학교명",
      degree: "TODO: 전공/학위",
      period: "TODO: YYYY.MM - YYYY.MM",
    },
  ],
  certifications: [
    // TODO: 실제 자격증으로 교체 (없으면 빈 배열로)
    { name: "TODO: 자격증명", issuer: "TODO: 발급기관", date: "TODO: YYYY.MM" },
  ],
};
