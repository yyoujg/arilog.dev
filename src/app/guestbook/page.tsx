import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = buildMetadata({
  title: "Guestbook",
  description: "방명록.",
  path: "/guestbook",
});

export default function GuestbookPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Guestbook</h1>
      <p className="text-muted-foreground mt-4">준비 중입니다.</p>
    </Container>
  );
}
