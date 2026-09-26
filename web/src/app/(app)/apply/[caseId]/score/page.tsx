import type { Metadata } from "next";

import { ScoreView } from "@/components/apply/score-view";

export const metadata: Metadata = { title: "Provisional score" };

export default function Page() {
  return <ScoreView />;
}
