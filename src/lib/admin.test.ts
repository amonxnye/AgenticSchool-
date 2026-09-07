import { describe, expect, it } from "vitest";
import { isAdminEmail } from "./admin";

describe("isAdminEmail", () => {
  it("matches the allowlist case-insensitively and ignores spacing", () => {
    const list = " Owner@Example.com, second@example.com ";
    expect(isAdminEmail("owner@example.com", list)).toBe(true);
    expect(isAdminEmail("SECOND@example.com", list)).toBe(true);
    expect(isAdminEmail("third@example.com", list)).toBe(false);
    expect(isAdminEmail("", list)).toBe(false);
    expect(isAdminEmail("owner@example.com", "")).toBe(false);
  });
});
