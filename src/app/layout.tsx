import type { Metadata } from "next";

import "./globals.css";
import { pretendard } from "@/lib/fonts";
import { env } from "@/lib/env";
import { SITE } from "@/constants/site";
import { ThemeProvider } from "@/components/common/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  // 상대경로 metadata가 절대 URL로 해석되도록 런타임 해석된 SITE_URL을 base로.
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  // 색인 불가 환경(프리뷰/로컬)에서는 robots meta로도 색인을 막는다(robots.txt와 2중).
  robots: env.IS_INDEXABLE ? undefined : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
