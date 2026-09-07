import { describe, expect, it } from "vitest";
import { anthropicProvider, mockProvider, selectProvider, streamChat } from "./gateway";

describe("gateway", () => {
  it("selects the mock provider only when asked for it", () => {
    expect(selectProvider("mock")).toBe(mockProvider);
    expect(selectProvider("anthropic")).toBe(anthropicProvider);
    expect(selectProvider(undefined)).toBe(anthropicProvider);
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
