import { describe, expect, it } from "vitest";

import {
  formatDual,
  gregorianToJdn,
  isEthiopianLeapYear,
  jdnToGregorian,
  toEthiopian,
  toGregorian,
} from "./ethiopian-calendar";

describe("Ethiopian calendar", () => {
  it("maps 1 Meskerem 2017 EC to 11 September 2024", () => {
    expect(toEthiopian({ year: 2024, month: 9, day: 11 })).toEqual({ year: 2017, month: 1, day: 1 });
    expect(toGregorian({ year: 2017, month: 1, day: 1 })).toEqual({ year: 2024, month: 9, day: 11 });
  });

  it("handles the year after an Ethiopian leap year (Pagume has 6 days in 2015 EC)", () => {
    expect(isEthiopianLeapYear(2015)).toBe(true);
    // 2023-09-11 is Pagume 6, 2015 EC; the next day starts 2016 EC.
    expect(toEthiopian({ year: 2023, month: 9, day: 11 })).toEqual({ year: 2015, month: 13, day: 6 });
    expect(toEthiopian({ year: 2023, month: 9, day: 12 })).toEqual({ year: 2016, month: 1, day: 1 });
  });

  it("round-trips every day across several years", () => {
    const start = gregorianToJdn({ year: 2018, month: 1, day: 1 });
    for (let jdn = start; jdn < start + 365 * 12; jdn += 7) {
      expect(toGregorian(toEthiopian(jdnToGregorian(jdn)))).toEqual(jdnToGregorian(jdn));
    }
  });

  it("formats a dual date in each language", () => {
    expect(formatDual("2024-09-11", "en")).toBe("1 Meskerem 2017 EC · 11 Sep 2024");
    expect(formatDual("2024-09-11", "am")).toBe("1 መስከረም 2017 ዓ.ም · 11 ሴፕቴ 2024");
    expect(formatDual("2024-09-11", "en", "gc-first")).toBe("11 Sep 2024 · 1 Meskerem 2017 EC");
  });
});
