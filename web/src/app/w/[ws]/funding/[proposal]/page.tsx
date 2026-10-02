import { redirect } from "next/navigation";

export default async function ProposalIndex({ params }: PageProps<"/w/[ws]/funding/[proposal]">) {
  const { ws, proposal } = await params;
  redirect(`/w/${ws}/funding/${proposal}/pack`);
}
