import type { Metadata } from "next";

import { IntakeScreen } from "@/components/apply/intake-screen";

export const metadata: Metadata = { title: "Start an application" };

export default function ApplyPage() {
  return <IntakeScreen />;
}
