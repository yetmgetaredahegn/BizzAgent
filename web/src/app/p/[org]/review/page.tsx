import { ReviewDashboard } from "@/components/review/review-dashboard";
import { ReviewGate } from "@/components/partner/partner-screens";

export default function ReviewPage() {
  return (
    <ReviewGate>
      <ReviewDashboard />
    </ReviewGate>
  );
}
