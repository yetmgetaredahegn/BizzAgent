import { OnboardingFrame } from "@/components/onboarding/frame";

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingFrame>{children}</OnboardingFrame>;
}
