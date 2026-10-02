import type { Metadata } from "next";

import { ImpactView } from "@/components/apply/impact-view";

export const metadata: Metadata = { title: "ImpactProtocol draft" };

export default function Page() {
  return <ImpactView />;
}
