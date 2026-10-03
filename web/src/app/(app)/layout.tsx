import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader mode="app" />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
