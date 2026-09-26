import { Hero } from "@/components/landing/hero";
import {
  CtaBand,
  DeclarationsSpotlight,
  Honesty,
  HowItWorks,
  Languages,
  Personas,
  ProblemStrip,
  ReviewerPreview,
  TwoPaths,
} from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProblemStrip />
      <HowItWorks />
      <Honesty />
      <Personas />
      <TwoPaths />
      <DeclarationsSpotlight />
      <ReviewerPreview />
      <Languages />
      <CtaBand />
    </>
  );
}
