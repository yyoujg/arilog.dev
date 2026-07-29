import type { ExperienceItem } from "@/types/resume";

// 경력 타임라인. 회사 단위로 그룹핑해 회사명 1회 + role/period만 압축 표시.
// 불릿 상세는 /resume 전용 — 여기서는 렌더하지 않는다.
export function Timeline({ items }: { items: ExperienceItem[] }) {
  const groups = items.reduce<{ company: string; items: ExperienceItem[] }[]>(
    (groups, exp) => {
      const last = groups[groups.length - 1];
      if (last?.company === exp.company) {
        last.items.push(exp);
      } else {
        groups.push({ company: exp.company, items: [exp] });
      }
      return groups;
    },
    [],
  );

  return (
    <ol className="border-border relative ml-3 border-l">
      {groups.map((group, gi) => (
        <li key={gi} className="mb-8 ml-6 last:mb-0">
          <span
            aria-hidden
            className="bg-primary border-background absolute -left-[7px] mt-1.5 size-3 rounded-full border-2"
          />
          <h3 className="font-semibold">{group.company}</h3>
          <ul className="mt-2 space-y-1.5">
            {group.items.map((item, i) => (
              <li
                key={i}
                className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm"
              >
                <span>{item.role}</span>
                <span className="text-muted-foreground shrink-0">
                  {item.period}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
