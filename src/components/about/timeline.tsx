import type { ExperienceItem } from "@/types/resume";

// 경력 타임라인. 왼쪽 세로선 + 점, 항목별 기간/회사/역할/설명.
export function Timeline({ items }: { items: ExperienceItem[] }) {
  return (
    <ol className="border-border relative ml-3 border-l">
      {items.map((item, i) => (
        <li key={i} className="mb-8 ml-6 last:mb-0">
          <span
            aria-hidden
            className="bg-primary border-background absolute -left-[7px] mt-1.5 size-3 rounded-full border-2"
          />
          <p className="text-muted-foreground text-sm">{item.period}</p>
          <h3 className="mt-0.5 font-semibold">{item.company}</h3>
          <p className="text-muted-foreground text-sm">{item.role}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {item.description.map((d, j) => (
              <li key={j}>{d}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
