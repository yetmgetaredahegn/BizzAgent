import { describe, expect, it } from "vitest";

import { diffWords } from "./diff";

describe("diffWords", () => {
  it("marks added and removed words and keeps the rest", () => {
    const parts = diffWords("Maths is hard.", "Maths practice is hard. For students.");
    expect(parts).toEqual([
      { type: "same", text: "Maths" },
      { type: "added", text: "practice" },
      { type: "same", text: "is hard." },
      { type: "added", text: "For students." },
    ]);
  });

  it("returns a single removed part when the new text is empty", () => {
    expect(diffWords("old text", "")).toEqual([{ type: "removed", text: "old text" }]);
  });
});
