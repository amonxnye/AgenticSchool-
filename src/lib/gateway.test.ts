import { describe, expect, it } from "vitest";
import { mockProvider, providerFor, streamChat } from "./gateway";
import type { ModelSettings } from "./settings";

const base: ModelSettings = {
  provider: "mock",
  ripa: { baseUrl: "https://api.ripaplatform.com/v1", model: "llama3.2:3b", apiKey: "sk-test" },
  anthropic: { model: "claude-opus-5", apiKey: "" },
};

describe("gateway", () => {
  it("builds the provider the settings ask for", () => {
    expect(providerFor(base)).toBe(mockProvider);
    const ripa = providerFor({ ...base, provider: "ripa" });
    expect(ripa.name).toBe("ripa");
    expect(ripa.model).toBe("llama3.2:3b");
    const anthropic = providerFor({ ...base, provider: "anthropic" });
    expect(anthropic.name).toBe("anthropic");
    expect(anthropic.model).toBe("claude-opus-5");
  });

  it("fails fast when RIPA has no key or model", async () => {
    const req = { system: "s", messages: [{ role: "user" as const, content: "hi" }] };
    const noKey = providerFor({ ...base, provider: "ripa", ripa: { ...base.ripa, apiKey: "" } });
    await expect(noKey.stream(req)[Symbol.asyncIterator]().next()).rejects.toThrow("API key");
    const noModel = providerFor({ ...base, provider: "ripa", ripa: { ...base.ripa, model: "" } });
    await expect(noModel.stream(req)[Symbol.asyncIterator]().next()).rejects.toThrow("model");
  });

  it("streams a complete reply from the mock provider", async () => {
    let text = "";
    for await (const chunk of streamChat(
      { system: "test", messages: [{ role: "user", content: "hello" }] },
      mockProvider,
    )) {
      text += chunk;
    }
    expect(text).toContain("hello");
    expect(text).toContain("mock provider");
  });
});
