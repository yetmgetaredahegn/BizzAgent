import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader mode="landing" />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
