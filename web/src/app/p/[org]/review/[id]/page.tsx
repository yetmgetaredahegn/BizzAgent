import { ReviewGate } from "@/components/partner/partner-screens";
import { ReviewDetail } from "@/components/review/review-detail";
import { REVIEW_BATCH } from "@/lib/fixtures";

// Demo applications are prerendered per partner; submitted or imported ones render on demand.
export function generateStaticParams() {
  return REVIEW_BATCH.map((pack) => ({ org: "highland", id: pack.id }));
}

export default async function ReviewDetailPage({ params }: PageProps<"/p/[org]/review/[id]">) {
  const { id } = await params;
  return (
    <ReviewGate>
      <ReviewDetail id={id} />
    </ReviewGate>
  );
}
