import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";

/* Temporary frame for the funding screens until they move into the app shell (F5/F8). */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </>
  );
}
