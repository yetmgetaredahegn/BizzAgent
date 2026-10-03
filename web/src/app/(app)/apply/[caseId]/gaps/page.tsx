import type { Metadata } from "next";

import { GapsView } from "@/components/apply/gaps-view";

export const metadata: Metadata = { title: "Gap list" };

export default function Page() {
  return <GapsView />;
}
