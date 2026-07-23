"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/nav";
import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm print:hidden">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="검색 (준비 중)"
            disabled
          >
            <SearchIcon className="size-5" />
          </Button>
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
