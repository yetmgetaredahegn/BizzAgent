import type { Metadata } from "next";

import { ReviewDetail } from "@/components/review/review-detail";
import { REVIEW_BATCH } from "@/lib/fixtures";

// Demo applications are prerendered; submitted or imported ones render on demand.
export function generateStaticParams() {
  return REVIEW_BATCH.map((pack) => ({ id: pack.id }));
}

export async function generateMetadata({ params }: PageProps<"/review/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pack = REVIEW_BATCH.find((p) => p.id === id);
  return { title: pack?.data.applicant.company_profile.company_name ?? "Application" };
}

export default async function ReviewDetailPage({ params }: PageProps<"/review/[id]">) {
  const { id } = await params;
  return <ReviewDetail id={id} />;
}
