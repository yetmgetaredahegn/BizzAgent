import type { Metadata } from "next";

import { PackView } from "@/components/apply/pack-view";

export const metadata: Metadata = { title: "Application pack" };

export default function Page() {
  return <PackView />;
}
