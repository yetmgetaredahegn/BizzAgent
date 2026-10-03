import { notFound } from "next/navigation";

import { CaseShell } from "@/components/apply/case-shell";
import { DEMO_CASE_IDS } from "@/lib/fixtures";

const CASE_IDS: string[] = [...DEMO_CASE_IDS, "live"];

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_IDS.map((caseId) => ({ caseId }));
}

export default async function CaseLayout({ children, params }: LayoutProps<"/apply/[caseId]">) {
  const { caseId } = await params;
  if (!CASE_IDS.includes(caseId)) notFound();
  return <CaseShell caseId={caseId}>{children}</CaseShell>;
}
