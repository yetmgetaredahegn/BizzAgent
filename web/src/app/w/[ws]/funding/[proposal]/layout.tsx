import { notFound } from "next/navigation";

import { casesFor } from "@/components/funding/cases";
import { FundingShell } from "@/components/funding/funding-shell";

export default async function ProposalLayout({ children, params }: LayoutProps<"/w/[ws]/funding/[proposal]">) {
  const { ws, proposal } = await params;
  if (!casesFor(ws).includes(proposal)) notFound();
  return <FundingShell caseId={proposal}>{children}</FundingShell>;
}
