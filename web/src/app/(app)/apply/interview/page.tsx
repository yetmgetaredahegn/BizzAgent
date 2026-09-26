import type { Metadata } from "next";

import { InterviewScreen } from "@/components/apply/interview-screen";

export const metadata: Metadata = { title: "Voice interview" };

export default function InterviewPage() {
  return <InterviewScreen />;
}
