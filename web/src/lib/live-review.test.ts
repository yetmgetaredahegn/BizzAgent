import { describe, expect, it } from "vitest";

import { analyzePack } from "./analyze";
import { emptyApplication } from "./fixtures/build";
import { REVIEW_BATCH } from "./fixtures";
import { buildLivePack } from "./live-pack";
import { parseBatch, rankBatch, shortlistCsv } from "./review";
import { SHORTLIST_SIZE } from "./grid";
import type { LiveSession } from "./store";

function session(): LiveSession {
  const application = emptyApplication();
  application.applicant.company_profile.company_name = "Selam Tailoring";
  application.applicant.company_profile.address = "Kebele 04, Adama";
  return {
    language: "am",
    startedAt: "2026-09-26T08:00:00Z",
    documents: {
      licence: { filename: "licence.jpg", content_type: "image/jpeg" },
      workshop: { filename: "workshop.jpg", content_type: "image/jpeg" },
      checked: true,
    },
    interview: {
      application,
      current_question: { field: "type_of_business", question: "What type of business do you operate?" },
      completed_fields: ["company_name", "address"],
      audio_url: null,
      history: [
        { field: "company_name", question: "What is the name of your business?", transcript: "Selam Tailoring" },
        { field: "address", question: "Where is your business located?", transcript: "Kebele 04, Adama" },
      ],
    },
    lastTranscript: null,
  };
}

describe("live pack", () => {
  it("keeps spoken answers unverified, with the transcript as evidence", () => {
    const analysis = analyzePack(buildLivePack(session()));
    const name = analysis.fields["company_profile.company_name"];
    expect(name.status).toBe("unverified");
    expect(name.provenance?.source).toBe("applicant_voice");
    expect(name.provenance?.evidence).toContain("Selam Tailoring");
  });

  it("marks everything the interview did not cover as missing", () => {
    const analysis = analyzePack(buildLivePack(session()));
    expect(analysis.fields["company_overview.growth_indicators"].status).toBe("missing");
    expect(analysis.fields["licence.licence_number"].status).toBe("missing");
    expect(analysis.counts.established).toBe(0);
  });

  it("does not score a live pack on evidence it does not have", () => {
    const { evaluation } = analyzePack(buildLivePack(session()));
    expect(evaluation.total).toBe(0);
    expect(evaluation.gate.find((c) => c.id === "licence")?.outcome).toBe("unknown");
  });
});

describe("reviewer ranking", () => {
  const ranked = rankBatch(REVIEW_BATCH.map((pack) => ({ pack, source: "batch" as const })));

  it("shortlists up to capacity and never ranks excluded applications", () => {
    expect(ranked.filter((r) => r.status === "shortlist")).toHaveLength(SHORTLIST_SIZE);
    for (const r of ranked.filter((r) => r.status === "excluded")) expect(r.rank).toBeNull();
  });

  it("orders eligible applications by score", () => {
    const scores = ranked.filter((r) => r.rank != null).map((r) => r.analysis.evaluation.total);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("exports one CSV row per application", () => {
    expect(shortlistCsv(ranked).split("\n")).toHaveLength(REVIEW_BATCH.length + 1);
  });

  it("round-trips the sample batch through import", () => {
    const { packs, rejected } = parseBatch(JSON.stringify(REVIEW_BATCH));
    expect(rejected).toBe(0);
    expect(packs).toHaveLength(REVIEW_BATCH.length);
    expect(analyzePack(packs[0]).evaluation.total).toBe(analyzePack(REVIEW_BATCH[0]).evaluation.total);
  });

  it("rejects entries without application data", () => {
    const { packs, rejected } = parseBatch(JSON.stringify([{ id: "x" }, REVIEW_BATCH[1]]));
    expect(packs).toHaveLength(1);
    expect(rejected).toBe(1);
  });
});
