import type { Metadata } from "next";

import { GoogleAnalytics } from "@next/third-parties/google";

import "./globals.css";
import { pretendard } from "@/lib/fonts";
import { env } from "@/lib/env";
import { clientEnv } from "@/lib/env.client";
import { SITE } from "@/constants/site";
import { ThemeProvider } from "@/components/common/theme-provider";
import { ExternalLinkTracker } from "@/components/common/external-link-tracker";
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
          <ExternalLinkTracker />
        </ThemeProvider>
        {/* GA4는 production + ID 존재 시에만. next/script afterInteractive라 LCP 비차단. */}
        {clientEnv.gaId && process.env.NODE_ENV === "production" && (
          <GoogleAnalytics gaId={clientEnv.gaId} />
        )}
      </body>
    </html>
  );
}
