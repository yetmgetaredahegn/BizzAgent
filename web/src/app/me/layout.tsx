import { AppShell } from "@/components/shell/app-shell";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell wsId={null} kind="venture">
      {children}
    </AppShell>
  );
}
