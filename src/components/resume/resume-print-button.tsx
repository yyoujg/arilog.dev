"use client";

import { PrinterIcon } from "lucide-react";

import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function ResumePrintButton() {
  function handlePrint() {
    track("resume_print");
    window.print();
  }

  return (
    <Button onClick={handlePrint} variant="outline" className="print:hidden">
      <PrinterIcon className="size-4" /> 인쇄 / PDF로 저장
    </Button>
  );
}
