import { describe, expect, it } from "vitest";

import { shareState } from "./passport";

const base = { id: "s", token: "t", scope: "basic" as const, createdAt: "2026-09-01", views: [] };

describe("shareState", () => {
  it("is valid up to and including its expiry day", () => {
    expect(shareState({ ...base, expiresAt: "2026-10-02", revoked: false }, "2026-10-02")).toBe("ok");
    expect(shareState({ ...base, expiresAt: "2026-10-01", revoked: false }, "2026-10-02")).toBe("expired");
  });

  it("revoking wins over an unexpired date", () => {
    expect(shareState({ ...base, expiresAt: "2027-01-01", revoked: true }, "2026-10-02")).toBe("revoked");
  });
});
