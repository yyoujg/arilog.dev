"use client";

import { PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ResumePrintButton() {
  function handlePrint() {
    // TODO: Sprint 4에서 GA4 이벤트 전송 (event name: resume_print)
    window.print();
  }

  return (
    <Button onClick={handlePrint} variant="outline" className="print:hidden">
      <PrinterIcon className="size-4" /> 인쇄 / PDF로 저장
    </Button>
  );
}
