import type { Metadata } from "next";

import { ReviewDashboard } from "@/components/review/review-dashboard";

export const metadata: Metadata = { title: "Reviewer dashboard" };

export default function ReviewPage() {
  return <ReviewDashboard />;
}
