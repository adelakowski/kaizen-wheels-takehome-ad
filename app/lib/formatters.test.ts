import { describe, expect, it } from "vitest";

import { formatCents, formatDollars } from "@/lib/formatters";

describe("formatDollars", () => {
  it("formats whole-dollar USD amounts", () => {
    expect(formatDollars(45)).toBe("$45");
    expect(formatDollars(220)).toBe("$220");
  });
});

describe("formatCents", () => {
  it("converts cents to dollar display", () => {
    expect(formatCents(4500)).toBe("$45");
    expect(formatCents(22000)).toBe("$220");
  });
});
