import { Suspense } from "react";

import { TalkScreen } from "@/components/talk/talk-screen";

export default function TalkPage() {
  return (
    <Suspense>
      <TalkScreen />
    </Suspense>
  );
}
