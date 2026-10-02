import { redirect } from "next/navigation";

export default async function CaseIndex({ params }: PageProps<"/apply/[caseId]">) {
  const { caseId } = await params;
  redirect(`/apply/${caseId}/pack`);
}
