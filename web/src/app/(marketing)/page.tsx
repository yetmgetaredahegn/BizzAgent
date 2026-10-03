import { Hero } from "@/components/landing/hero";
import { Compare, How, LanguageTiles, Partners, Pricing, Stories } from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <How />
      <Compare />
      <Stories />
      <Partners />
      <Pricing />
      <LanguageTiles />
    </>
  );
}
