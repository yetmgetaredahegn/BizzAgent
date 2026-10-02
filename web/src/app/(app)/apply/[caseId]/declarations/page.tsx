import type { Metadata } from "next";

import { DeclarationsView } from "@/components/apply/declarations-view";

export const metadata: Metadata = { title: "Declarations" };

export default function Page() {
  return <DeclarationsView />;
}
