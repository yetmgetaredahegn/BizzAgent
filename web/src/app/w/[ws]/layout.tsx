import { AppShell } from "@/components/shell/app-shell";

export default async function WorkspaceLayout({ children, params }: LayoutProps<"/w/[ws]">) {
  const { ws } = await params;
  return (
    <AppShell wsId={ws} kind="venture">
      {children}
    </AppShell>
  );
}
