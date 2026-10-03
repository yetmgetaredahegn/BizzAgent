"use client";

import { useMemo } from "react";

import { REVIEW_BATCH } from "@/lib/fixtures";
import { rankBatch, type RankedApplication, type ReviewSource } from "@/lib/review";
import { importedBatchStore, reviewQueueStore, useStore } from "@/lib/store";
import type { ApplicationPack } from "@/lib/types";

/** The batch under review: the demo twelve (or an imported batch) plus anything submitted from the applicant path. */
export function useRankedBatch(): { ranked: RankedApplication[]; imported: boolean } {
  const queue = useStore(reviewQueueStore);
  const imported = useStore(importedBatchStore);

  const ranked = useMemo(() => {
    const base: { pack: ApplicationPack; source: ReviewSource }[] = (imported ?? REVIEW_BATCH).map((pack) => ({
      pack,
      source: imported ? "imported" : "batch",
    }));
    const submitted = queue.map((pack) => ({ pack, source: "submitted" as const }));
    return rankBatch([...base, ...submitted]);
  }, [imported, queue]);

  return { ranked, imported: imported != null };
}
