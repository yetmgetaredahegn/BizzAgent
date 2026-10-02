/** The prototype's fixed "today", so demo deadlines and "closing soon" never drift. */
export const DEMO_TODAY = "2026-10-02";

export function daysFromToday(days: number): string {
  const [y, m, d] = DEMO_TODAY.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}
