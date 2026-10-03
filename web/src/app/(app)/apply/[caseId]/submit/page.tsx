import type { Metadata } from "next";

import { SubmitView } from "@/components/apply/submit-view";

export const metadata: Metadata = { title: "Submit" };

export default function Page() {
  return <SubmitView />;
}
