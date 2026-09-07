import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { decrypt, encrypt, encryptionConfigured } from "./crypto";

const original = process.env.SETTINGS_ENCRYPTION_KEY;

afterEach(() => {
  if (original === undefined) delete process.env.SETTINGS_ENCRYPTION_KEY;
  else process.env.SETTINGS_ENCRYPTION_KEY = original;
});

describe("crypto", () => {
  it("round-trips a secret and never stores it in the clear", () => {
    process.env.SETTINGS_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    const payload = encrypt("sk-very-secret");
    expect(payload).not.toContain("sk-very-secret");
    expect(payload.startsWith("v1.")).toBe(true);
    expect(decrypt(payload)).toBe("sk-very-secret");
    expect(encrypt("x")).not.toBe(encrypt("x"));
  });

  it("reports and rejects a missing or malformed key", () => {
    delete process.env.SETTINGS_ENCRYPTION_KEY;
    expect(encryptionConfigured()).toBe(false);
    expect(() => encrypt("x")).toThrow("SETTINGS_ENCRYPTION_KEY");
    process.env.SETTINGS_ENCRYPTION_KEY = "too-short";
    expect(encryptionConfigured()).toBe(false);
  });

  it("rejects tampered ciphertext", () => {
    process.env.SETTINGS_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    const payload = encrypt("secret");
    const parts = payload.split(".");
    parts[3] = Buffer.from("garbage").toString("base64");
    expect(() => decrypt(parts.join("."))).toThrow();
  });
});
