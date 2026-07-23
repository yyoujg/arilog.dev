import { SITE } from "@/constants/site";
import { Container } from "@/components/layout/container";
import { GithubIcon, LinkedinIcon } from "@/components/common/brand-icons";

// Mail/RSS는 브랜드 아이콘이 아니라 여기 인라인으로 둔다(GitHub/LinkedIn은 공용).
function MailIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function RssIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

export function Footer() {
  const links = [
    { href: SITE.github, label: "GitHub", Icon: GithubIcon },
    { href: SITE.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: `mailto:${SITE.email}`, label: "Email", Icon: MailIcon },
    { href: "/rss.xml", label: "RSS", Icon: RssIcon },
  ];

  return (
    <footer className="border-border/60 mt-auto border-t print:hidden">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} {SITE.author}. All rights reserved.
        </p>
        <ul className="flex items-center gap-1">
          {links.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-9 items-center justify-center rounded-md transition-colors"
              >
                <Icon className="size-5" />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
