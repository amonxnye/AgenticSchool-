import { describe, expect, it } from "vitest";
import { defaultsFromEnv, keyHint, redact } from "./settings";

describe("settings", () => {
  it("defaults to RIPA with the public gateway URL", () => {
    const s = defaultsFromEnv({});
    expect(s.provider).toBe("ripa");
    expect(s.ripa.baseUrl).toBe("https://api.ripaplatform.com/v1");
    expect(s.ripa.model).toBe("");
    expect(s.anthropic.model).toBe("claude-opus-5");
  });

  it("honours environment overrides", () => {
    const s = defaultsFromEnv({ MODEL_PROVIDER: "mock", RIPA_MODEL: "llama3.2:3b", RIPA_API_KEY: "sk-1234" });
    expect(s.provider).toBe("mock");
    expect(s.ripa.model).toBe("llama3.2:3b");
    expect(s.ripa.apiKey).toBe("sk-1234");
    expect(defaultsFromEnv({ MODEL_PROVIDER: "nonsense" }).provider).toBe("ripa");
  });

  it("redacts keys down to a presence flag and a hint", () => {
    const r = redact({ ...defaultsFromEnv({ RIPA_API_KEY: "sk-abcdef" }), updatedBy: "admin@example.com" });
    expect(r.ripa).toEqual({ baseUrl: "https://api.ripaplatform.com/v1", model: "", hasKey: true, keyHint: "…cdef" });
    expect(r.anthropic.hasKey).toBe(false);
    expect(JSON.stringify(r)).not.toContain("sk-abcdef");
    expect(keyHint("abc")).toBe("");
  });
});
