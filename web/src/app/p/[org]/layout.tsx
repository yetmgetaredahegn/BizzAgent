import { AppShell } from "@/components/shell/app-shell";

export default async function PartnerLayout({ children, params }: LayoutProps<"/p/[org]">) {
  const { org } = await params;
  return (
    <AppShell wsId={org} kind="partner">
      {children}
    </AppShell>
  );
}
